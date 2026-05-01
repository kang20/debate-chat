export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidNickname(nickname: string): boolean {
  return nickname.length >= 2 && nickname.length <= 20;
}
