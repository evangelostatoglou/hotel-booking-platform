import bcrypt from "bcrypt";
import { AuthUser, NewUser, db_findUserByEmail, db_addUser, FullUser } from "../repositories/user.repository";
import { RegisterInput } from "../validators/auth.schemas";

export type AuthenticatedUser = {
  id: number,
  email: string,
  role: string | null,
  firstName: string,
  lastName: string
};



 
export async function s_loginUser(email: string, password: string): Promise<AuthenticatedUser | null> {
  const user = await db_findUserByEmail(email);

  if (!user) return null;
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) return null;
  // console.log("---service");
  // console.log(user);

  const { password_hash, ...result} = user;
  return result;
};


export async function s_registerUser(input: RegisterInput):Promise<FullUser|null>{

  const user = await db_findUserByEmail(input.email);
  if(user) return null ;
  const passHash = await bcrypt.hash(input.password, 12);
  return db_addUser(input as NewUser, passHash);
  
}



