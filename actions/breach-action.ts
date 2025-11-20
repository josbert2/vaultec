"use server";

import { getCurrentUser } from "./user-action";
import { prisma } from "@/lib/prisma";
import { checkPasswordBreach, delay } from "@/lib/hibp-service";

export interface BreachStats {
  totalPasswords: number;
  breachedPasswords: number;
  lastScan: Date | null;
  breachedList: Array<{
    id: string;
    websiteName: string;
    breachCount: number;
  }>;
}

/**
 * Check a single password for breaches
 */
export async function checkSinglePasswordBreach(passwordId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  try {
    const password = await prisma.password.findUnique({
      where: { id: passwordId, userId: currentUser.id },
    });

    if (!password) {
      throw new Error("Password not found");
    }

    const result = await checkPasswordBreach(password.password);

    await prisma.password.update({
      where: { id: passwordId },
      data: {
        isBreached: result.isBreached,
        breachCount: result.count,
        lastBreachCheck: new Date(),
      },
    });

    return {
      success: true,
      isBreached: result.isBreached,
      count: result.count,
    };
  } catch (error) {
    console.error("Failed to check password breach:", error);
    throw new Error("Failed to check password breach");
  }
}

/**
 * Scan all user passwords for breaches
 */
export async function scanAllPasswords() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  try {
    const passwords = await prisma.password.findMany({
      where: { userId: currentUser.id },
      select: { id: true, password: true, websiteName: true },
    });

    let scannedCount = 0;
    let breachedCount = 0;
    const breachedPasswords: Array<{
      id: string;
      websiteName: string;
      count: number;
    }> = [];

    for (const pwd of passwords) {
      try {
        const result = await checkPasswordBreach(pwd.password);

        await prisma.password.update({
          where: { id: pwd.id },
          data: {
            isBreached: result.isBreached,
            breachCount: result.count,
            lastBreachCheck: new Date(),
          },
        });

        if (result.isBreached) {
          breachedCount++;
          breachedPasswords.push({
            id: pwd.id,
            websiteName: pwd.websiteName,
            count: result.count,
          });
        }

        scannedCount++;

        // Rate limiting: 1.5 second delay between requests
        if (scannedCount < passwords.length) {
          await delay(1500);
        }
      } catch (error) {
        console.error(`Failed to check password ${pwd.id}:`, error);
        // Continue with next password
      }
    }

    return {
      success: true,
      scanned: scannedCount,
      breached: breachedCount,
      breachedPasswords,
    };
  } catch (error) {
    console.error("Failed to scan passwords:", error);
    throw new Error("Failed to scan passwords");
  }
}

/**
 * Get breach statistics for current user
 */
export async function getBreachStats(): Promise<BreachStats> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  try {
    const [totalPasswords, breachedPasswords, lastChecked] = await Promise.all([
      prisma.password.count({
        where: { userId: currentUser.id },
      }),
      prisma.password.findMany({
        where: {
          userId: currentUser.id,
          isBreached: true,
        },
        select: {
          id: true,
          websiteName: true,
          breachCount: true,
        },
        orderBy: {
          breachCount: "desc",
        },
      }),
      prisma.password.findFirst({
        where: {
          userId: currentUser.id,
          lastBreachCheck: { not: null },
        },
        orderBy: {
          lastBreachCheck: "desc",
        },
        select: {
          lastBreachCheck: true,
        },
      }),
    ]);

    return {
      totalPasswords,
      breachedPasswords: breachedPasswords.length,
      lastScan: lastChecked?.lastBreachCheck || null,
      breachedList: breachedPasswords,
    };
  } catch (error) {
    console.error("Failed to get breach stats:", error);
    throw new Error("Failed to get breach stats");
  }
}
