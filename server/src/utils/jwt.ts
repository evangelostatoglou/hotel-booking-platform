import jwt, {type SignOptions} from "jsonwebtoken";

export type TokenUser = {
  id: number;
  role: string | null;
};

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

export const getJwtDuration = (): SignOptions["expiresIn"] => {
  let duration = process.env.JWT_EXPIRES_IN;

  if (!duration) {
    console.warn("JWT_DURATION is not configured -> SETTING DEFAULT TO 1000H");
    duration = "1000h";
  }

  return duration as SignOptions["expiresIn"];
};

export function createJWT (user: TokenUser): string {
  return jwt.sign({
    userId: user.id, 
    role: user.role
    },
    getJwtSecret(),
    {expiresIn: getJwtDuration()});
};

export function verifyJWT(token: string): TokenUser | null{

  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded === "string" || typeof decoded.userId !== "number") {
    throw new Error("Invalid token payload");
  }

  const result: TokenUser = {
    id: decoded.userId, 
    role: (typeof decoded.role === "string")? decoded.role : null
  };

  return result;
}

