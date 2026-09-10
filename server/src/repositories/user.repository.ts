import { appPool } from "../config/database";

export type AuthUser = {
  id: number,
  email: string,
  password_hash: string,
  role: string | null,
  firstName: string,
  lastName: string
};

export type NewUser = {
  firstName: string,
  lastName: string,
  email: string,
  phone: string | null
};

export type FullUser = NewUser & {id: number, role: string, createdAt: Date}

export type PublicUser = {
  id: number,
  email: string,
  role: string | null,
  firstName: string,
  lastName: string
};

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const result = await appPool.query<AuthUser>(
    `
    SELECT
        id,
        email,
        password_hash,
        role,
        first_name as "firstName",
        last_name as "lastName"
    FROM users
    WHERE email = $1
    LIMIT 1
    ;`,
    [email]
  );

  return result.rows[0] ?? null;
};

export async function findPublicUserById(id: number): Promise<PublicUser | null> {
  const result = await appPool.query<PublicUser>(
    `
    SELECT
      id,
      email,
      role,
      first_name AS "firstName",
      last_name AS "lastName"
    FROM users
    WHERE id = $1
    LIMIT 1;
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function addUser(input: NewUser, passHash: string):Promise<FullUser>{
  const result = await appPool.query(
    `
    INSERT INTO users (
      first_name,
      last_name,
      email,
      password_hash,
      phone,
      created_at,
      role
    )
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
    RETURNING
      id,
      first_name AS "firstName",
      last_name AS "lastName",
      email,
      phone,
      role,
      created_at AS "createdAt"
    `,
    [
      input.firstName,
      input.lastName,
      input.email,
      passHash,
      input.phone ?? null,
      "G"
    ]
  );

  return result.rows[0];
}


