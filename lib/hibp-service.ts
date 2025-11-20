import crypto from "crypto";

export interface BreachCheckResult {
  isBreached: boolean;
  count: number;
}

/**
 * Hash password using SHA-1 for HIBP API
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
}

/**
 * Check if password has been breached using HaveIBeenPwned API
 * Uses k-Anonymity model - only sends first 5 chars of hash
 */
export async function checkPasswordBreach(
  password: string
): Promise<BreachCheckResult> {
  try {
    const hash = hashPassword(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Call HIBP API with first 5 chars of hash
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "User-Agent": "Vaultec-Password-Manager",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HIBP API error: ${response.status}`);
    }

    const data = await response.text();
    const result = parseHIBPResponse(data, suffix);

    return result;
  } catch (error) {
    console.error("Failed to check password breach:", error);
    // Return safe default on error
    return { isBreached: false, count: 0 };
  }
}

/**
 * Parse HIBP API response and find matching hash suffix
 */
function parseHIBPResponse(
  response: string,
  suffix: string
): BreachCheckResult {
  const lines = response.split("\n");

  for (const line of lines) {
    const [hashSuffix, countStr] = line.split(":");
    if (hashSuffix.trim() === suffix) {
      return {
        isBreached: true,
        count: parseInt(countStr.trim(), 10),
      };
    }
  }

  return { isBreached: false, count: 0 };
}

/**
 * Delay helper for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
