import bcrypt from "bcrypt";

import { AuthUser, findUserByEmail } from "../repositories/user.repository";

export type AuthenticatedUser = Pick<AuthUser,"id" | "email" | "role">; // i only pic id, email, and role from AuthUser type cause thats all i need. we leave pass_hash behind to not accidentally send it back

export async function loginUser(email: string, password: string): Promise<AuthenticatedUser | null> {
  const user = await findUserByEmail(email);

  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) return null;

  return {id: user.id, email: user.email, role: user.role};
};