import { appPool } from "../config/database";

export type AuthUser = {
  id: number;
  email: string;
  password_hash: string;
  role: string | null;
};

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const result = await appPool.query<AuthUser>(
    `
    SELECT
        id,
        email,
        password_hash,
        role
    FROM users
    WHERE email = $1
    LIMIT 1
    ;`,
    [email]
  );

  return result.rows[0] ?? null;
};