export type UserRole = "student" | "teacher";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
};

export type DbUserRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  email_verified_at: string | null;
  created_at: string;
};

export type DbSessionRow = {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
};
