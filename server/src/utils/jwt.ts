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
  const duration = process.env.JWT_EXPIRES_IN;

  if (!duration) {
    throw new Error("JWT_EXPIRES_IN is not configured");
  }

  if (!/^\d+[smhd]$/.test(duration)) {
    throw new Error("JWT_EXPIRES_IN must use a whole-number s, m, h, or d duration");
  }

  return duration as SignOptions["expiresIn"];
};

export function getJwtMaxAgeMs(): number {
  const duration = getJwtDuration() as string;
  const value = Number(duration.slice(0, -1));
  const unit = duration.at(-1);
  const unitMilliseconds = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };

  return value * unitMilliseconds[unit as keyof typeof unitMilliseconds];
}

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

