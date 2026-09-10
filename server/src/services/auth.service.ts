import bcrypt from "bcrypt";
import { AuthUser, NewUser, findUserByEmail, findPublicUserById, addUser, FullUser, PublicUser } from "../repositories/user.repository";
import { RegisterInput } from "../validators/auth.schemas";

export type AuthenticatedUser = {
  id: number,
  email: string,
  role: string | null,
  firstName: string,
  lastName: string
};



 
export async function loginUser(email: string, password: string): Promise<AuthenticatedUser | null> {
  const user = await findUserByEmail(email);

  if (!user) return null;
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) return null;
  const { password_hash, ...result} = user;
  return result;
};


export async function registerUser(input: RegisterInput):Promise<FullUser|null>{

  const user = await findUserByEmail(input.email);
  if(user) return null ;
  const passHash = await bcrypt.hash(input.password, 12);
  return addUser(input as NewUser, passHash);
  
}

export async function getCurrentUser(userId: number): Promise<PublicUser | null> {
  return findPublicUserById(userId);
}



