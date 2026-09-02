import bcrypt from "bcrypt";
import { AuthUser, NewUser, db_findUserByEmail, db_addUser, FullUser } from "../repositories/user.repository";
import { RegisterInput } from "../validators/auth.schemas";

export type AuthenticatedUser = Pick<AuthUser,"id" | "email" | "role">; // i only pic id, email, and role from AuthUser type cause thats all i need. we leave pass_hash behind to not accidentally send it back



 
export async function s_loginUser(email: string, password: string): Promise<AuthenticatedUser | null> {
  const user = await db_findUserByEmail(email);

  if (!user) return null;
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) return null;

  return {id: user.id, email: user.email, role: user.role};
};


export async function s_registerUser(input: RegisterInput):Promise<FullUser|null>{

  const user = await db_findUserByEmail(input.email);
  if(user) return null ;
  const passHash = await bcrypt.hash(input.password, 12);
  return db_addUser(input as NewUser, passHash);
  
}



