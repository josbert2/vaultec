export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  percentage: number;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: "No password",
      color: "#9ca3af",
      percentage: 0,
    };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };

  // Length check (most important)
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety
  if (checks.lowercase && checks.uppercase) score++;
  if (checks.numbers) score++;
  if (checks.symbols) score++;

  // Bonus for very long passwords
  if (password.length >= 20) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const strengthMap = {
    0: { label: "Very Weak", color: "#ef4444", percentage: 20 },
    1: { label: "Weak", color: "#f97316", percentage: 40 },
    2: { label: "Fair", color: "#f59e0b", percentage: 60 },
    3: { label: "Strong", color: "#10b981", percentage: 80 },
    4: { label: "Very Strong", color: "#22c55e", percentage: 100 },
  };

  return {
    score,
    ...strengthMap[score as keyof typeof strengthMap],
  };
}

export function getPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
}
