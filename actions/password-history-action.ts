"use server";

import prisma from "@/prisma/db";
import { ChangeType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user-action";
import { cryptr } from "@/lib/crypto";

/**
 * Get password history for a specific password
 */
export const getPasswordHistory = async (passwordId: string) => {
  try {
    const currentUser = await getCurrentUser();

    const password = await prisma.password.findFirst({
      where: {
        id: passwordId,
        userId: currentUser?.id,
      },
    });

    if (!password) {
      throw new Error("Password not found or unauthorized");
    }

    const history = await prisma.passwordHistory.findMany({
      where: {
        passwordId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        changedAt: "desc",
      },
    });

    return history;
  } catch (error) {
    console.error("Failed to get password history:", error);
    throw new Error("Failed to get password history");
  }
};

/**
 * Create history entry when password is created or updated
 */
export const createHistoryEntry = async (params: {
  passwordId: string;
  oldPassword: string;
  oldEmail?: string | null;
  oldUsername?: string | null;
  oldUrl?: string | null;
  changeType: ChangeType;
  ipAddress?: string;
}) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      console.error("❌ History: User not authenticated");
      return;
    }

    console.log("📝 Creating history entry:", {
      passwordId: params.passwordId,
      changeType: params.changeType,
      userId: currentUser.id,
    });

    const result = await prisma.passwordHistory.create({
      data: {
        passwordId: params.passwordId,
        oldPassword: params.oldPassword,
        oldEmail: params.oldEmail,
        oldUsername: params.oldUsername,
        oldUrl: params.oldUrl,
        changedBy: currentUser.id,
        changeType: params.changeType,
        ipAddress: params.ipAddress,
      },
    });

    console.log("✅ History entry created:", result.id);
  } catch (error) {
    console.error("❌ Failed to create history entry:", error);
    // Don't throw error to prevent blocking password operations
  }
};

/**
 * Restore password from history
 */
export const restoreFromHistory = async (historyId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      throw new Error("User not authenticated");
    }

    const historyEntry = await prisma.passwordHistory.findUnique({
      where: { id: historyId },
      include: {
        password: true,
      },
    });

    if (!historyEntry) {
      throw new Error("History entry not found");
    }

    // Verify user owns this password
    if (historyEntry.password.userId !== currentUser.id) {
      throw new Error("Unauthorized");
    }

    // Save current state to history before restoring
    await createHistoryEntry({
      passwordId: historyEntry.passwordId,
      oldPassword: historyEntry.password.password,
      oldEmail: historyEntry.password.email,
      oldUsername: historyEntry.password.username,
      oldUrl: historyEntry.password.url,
      changeType: "UPDATED",
    });

    // Restore the password
    await prisma.password.update({
      where: { id: historyEntry.passwordId },
      data: {
        password: historyEntry.oldPassword,
        email: historyEntry.oldEmail,
        username: historyEntry.oldUsername,
        url: historyEntry.oldUrl,
      },
    });

    // Create new history entry for restoration
    await createHistoryEntry({
      passwordId: historyEntry.passwordId,
      oldPassword: historyEntry.oldPassword,
      oldEmail: historyEntry.oldEmail,
      oldUsername: historyEntry.oldUsername,
      oldUrl: historyEntry.oldUrl,
      changeType: "RESTORED",
    });

    revalidatePath("/dashboard");

    return {
      message: "Password restored successfully",
    };
  } catch (error) {
    console.error("Failed to restore password:", error);
    throw new Error("Failed to restore password from history");
  }
};

/**
 * Delete old history entries (cleanup/retention policy)
 */
export const cleanupOldHistory = async (
  passwordId: string,
  keepLastN: number = 10
) => {
  try {
    const history = await prisma.passwordHistory.findMany({
      where: { passwordId },
      orderBy: { changedAt: "desc" },
      select: { id: true },
    });

    if (history.length <= keepLastN) {
      return; // Nothing to delete
    }

    const idsToKeep = history.slice(0, keepLastN).map((h) => h.id);

    await prisma.passwordHistory.deleteMany({
      where: {
        passwordId,
        id: { notIn: idsToKeep },
      },
    });
  } catch (error) {
    console.error("Failed to cleanup old history:", error);
    // Don't throw error
  }
};
