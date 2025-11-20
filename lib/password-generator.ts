export interface PasswordGeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  usePassphrase: boolean;
}

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "0O1lI";

const WORDS = [
  "correct", "horse", "battery", "staple", "dragon", "monkey", "pizza", "coffee",
  "laptop", "sunset", "ocean", "mountain", "forest", "river", "cloud", "thunder",
  "lightning", "rainbow", "galaxy", "planet", "comet", "meteor", "asteroid", "nebula",
  "quantum", "photon", "electron", "neutron", "proton", "atom", "molecule", "crystal",
];

export function generatePassword(options: PasswordGeneratorOptions): string {
  if (options.usePassphrase) {
    return generatePassphrase(options.length);
  }

  let charset = "";
  
  if (options.lowercase) charset += LOWERCASE;
  if (options.uppercase) charset += UPPERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  if (charset === "") {
    charset = LOWERCASE + UPPERCASE + NUMBERS;
  }

  if (options.excludeAmbiguous) {
    charset = charset.split("").filter(char => !AMBIGUOUS.includes(char)).join("");
  }

  let password = "";
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Ensure at least one character from each selected type
  if (options.uppercase && !/[A-Z]/.test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)] + password.substring(pos + 1);
  }
  if (options.lowercase && !/[a-z]/.test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)] + password.substring(pos + 1);
  }
  if (options.numbers && !/\d/.test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + NUMBERS[Math.floor(Math.random() * NUMBERS.length)] + password.substring(pos + 1);
  }
  if (options.symbols && !/[^A-Za-z0-9]/.test(password)) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] + password.substring(pos + 1);
  }

  return password;
}

function generatePassphrase(wordCount: number): string {
  const numWords = Math.max(3, Math.min(8, Math.floor(wordCount / 4)));
  const selectedWords: string[] = [];
  
  for (let i = 0; i < numWords; i++) {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    selectedWords.push(WORDS[randomIndex]);
  }

  return selectedWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
}

export const DEFAULT_GENERATOR_OPTIONS: PasswordGeneratorOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
  usePassphrase: false,
};
