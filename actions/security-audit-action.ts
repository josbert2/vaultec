"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./user-action";
import { cryptr } from "@/lib/crypto";
import { passwordStrength } from "check-password-strength";

export interface SecurityAnalysis {
  overallScore: number;
  totalPasswords: number;
  weakPasswords: number;
  duplicates: number;
  oldPasswords: number;
  strongPasswords: number;
  issues: SecurityIssue[];
}

export interface SecurityIssue {
  id: string;
  type: "weak" | "duplicate" | "old";
  severity: "critical" | "warning" | "info";
  websiteName: string;
  message: string;
}

/**
 * Analyze all passwords for the current user
 * Returns comprehensive security analysis
 */
export const analyzeUserPasswords = async (): Promise<SecurityAnalysis> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    // Get all passwords for the user
    const passwords = await prisma.password.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        websiteName: true,
        password: true,
        createdAt: true,
        lastChanged: true,
        securityScore: true,
      },
    });

    if (passwords.length === 0) {
      return {
        overallScore: 100,
        totalPasswords: 0,
        weakPasswords: 0,
        duplicates: 0,
        oldPasswords: 0,
        strongPasswords: 0,
        issues: [],
      };
    }

    // Decrypt passwords for analysis
    const decryptedPasswords = passwords.map((p) => ({
      ...p,
      decryptedPassword: cryptr.decrypt(p.password),
    }));

    // Analyze each password
    const analyzedPasswords = decryptedPasswords.map((p: typeof decryptedPasswords[0]) => {
      const strength = passwordStrength(p.decryptedPassword);
      const score = calculatePasswordScore(strength.id);
      
      return {
        ...p,
        strengthId: strength.id,
        score,
        isWeak: score < 60,
        isOld: isPasswordOld(p.lastChanged),
      };
    });

    // Detect duplicates
    const duplicateMap = new Map<string, string[]>();
    analyzedPasswords.forEach((p: typeof analyzedPasswords[0]) => {
      const existing = duplicateMap.get(p.decryptedPassword) || [];
      existing.push(p.id);
      duplicateMap.set(p.decryptedPassword, existing);
    });

    const duplicateIds = new Set<string>();
    duplicateMap.forEach((ids) => {
      if (ids.length > 1) {
        ids.forEach((id) => duplicateIds.add(id));
      }
    });

    // Count metrics
    const weakPasswords = analyzedPasswords.filter((p) => p.isWeak).length;
    const oldPasswords = analyzedPasswords.filter((p) => p.isOld).length;
    const strongPasswords = passwords.length - weakPasswords;
    const duplicates = duplicateIds.size;

    // Build issues list
    const issues: SecurityIssue[] = [];

    // Weak password issues
    analyzedPasswords
      .filter((p: typeof analyzedPasswords[0]) => p.isWeak)
      .forEach((p: typeof analyzedPasswords[0]) => {
        issues.push({
          id: p.id,
          type: "weak",
          severity: p.score < 30 ? "critical" : "warning",
          websiteName: p.websiteName,
          message: `Weak password (score: ${p.score}/100)`,
        });
      });

    // Duplicate issues
    const processedDuplicates = new Set<string>();
    duplicateMap.forEach((ids, password) => {
      if (ids.length > 1) {
        const firstId = ids[0];
        if (!processedDuplicates.has(password)) {
          const firstPassword = analyzedPasswords.find((p) => p.id === firstId);
          if (firstPassword) {
            issues.push({
              id: firstId,
              type: "duplicate",
              severity: "warning",
              websiteName: firstPassword.websiteName,
              message: `Password used in ${ids.length} accounts`,
            });
          }
          processedDuplicates.add(password);
        }
      }
    });

    // Old password issues
    analyzedPasswords
      .filter((p: typeof analyzedPasswords[0]) => p.isOld)
      .forEach((p: typeof analyzedPasswords[0]) => {
        const daysSinceChange = Math.floor(
          (Date.now() - p.lastChanged.getTime()) / (1000 * 60 * 60 * 24)
        );
        issues.push({
          id: p.id,
          type: "old",
          severity: "info",
          websiteName: p.websiteName,
          message: `Not changed in ${daysSinceChange} days`,
        });
      });

    // Calculate overall score
    const overallScore = calculateOverallScore({
      totalPasswords: passwords.length,
      weakPasswords,
      duplicates,
      oldPasswords,
    });

    // Update password security scores in database
    await updatePasswordScores(analyzedPasswords);

    // Save audit result
    await saveSecurityAudit(user.id, {
      overallScore,
      totalPasswords: passwords.length,
      weakPasswords,
      duplicates,
      oldPasswords,
      strongPasswords,
    });

    return {
      overallScore,
      totalPasswords: passwords.length,
      weakPasswords,
      duplicates,
      oldPasswords,
      strongPasswords,
      issues: issues.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
    };
  } catch (error) {
    console.error("Error analyzing passwords:", error);
    throw new Error("Failed to analyze passwords");
  }
};

/**
 * Calculate password score from strength ID
 * 0 (Too weak) -> 20
 * 1 (Weak) -> 40
 * 2 (Medium) -> 70
 * 3 (Strong) -> 100
 */
function calculatePasswordScore(strengthId: number): number {
  const scoreMap: Record<number, number> = {
    0: 20,
    1: 40,
    2: 70,
    3: 100,
  };
  return scoreMap[strengthId] || 0;
}

/**
 * Check if password is old (>90 days)
 */
function isPasswordOld(lastChanged: Date): boolean {
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return lastChanged.getTime() < ninetyDaysAgo;
}

/**
 * Calculate overall security score (0-100)
 */
function calculateOverallScore(metrics: {
  totalPasswords: number;
  weakPasswords: number;
  duplicates: number;
  oldPasswords: number;
}): number {
  if (metrics.totalPasswords === 0) return 100;

  let score = 100;

  // Deduct for weak passwords (up to -40)
  const weakPercentage = (metrics.weakPasswords / metrics.totalPasswords) * 100;
  score -= Math.min(weakPercentage * 0.4, 40);

  // Deduct for duplicates (up to -30)
  const duplicatePercentage = (metrics.duplicates / metrics.totalPasswords) * 100;
  score -= Math.min(duplicatePercentage * 0.3, 30);

  // Deduct for old passwords (up to -30)
  const oldPercentage = (metrics.oldPasswords / metrics.totalPasswords) * 100;
  score -= Math.min(oldPercentage * 0.3, 30);

  return Math.max(Math.round(score), 0);
}

/**
 * Update security scores for all analyzed passwords
 */
async function updatePasswordScores(
  passwords: Array<{ id: string; score: number; isOld: boolean }>
): Promise<void> {
  await Promise.all(
    passwords.map((p) =>
      prisma.password.update({
        where: { id: p.id },
        data: {
          securityScore: p.score,
          needsUpdate: p.score < 60 || p.isOld,
        },
      })
    )
  );
}

/**
 * Save security audit result to database
 */
async function saveSecurityAudit(
  userId: string,
  data: {
    overallScore: number;
    totalPasswords: number;
    weakPasswords: number;
    duplicates: number;
    oldPasswords: number;
    strongPasswords: number;
  }
): Promise<void> {
  await prisma.securityAudit.create({
    data: {
      userId,
      ...data,
    },
  });
}

/**
 * Get latest security audit for current user
 */
export const getLatestSecurityAudit = async () => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    return await prisma.securityAudit.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error getting security audit:", error);
    return null;
  }
};
