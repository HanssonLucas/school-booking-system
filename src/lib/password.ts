import bcrypt from "bcryptjs";

const PASSWORD_SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export const validatePassword = (password: unknown) => {
  if (typeof password !== "string") {
    return "Lösenord måste vara text.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Lösenord måste vara minst ${MIN_PASSWORD_LENGTH} tecken.`;
  }

  return null;
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
) => {
  return bcrypt.compare(password, passwordHash);
};
