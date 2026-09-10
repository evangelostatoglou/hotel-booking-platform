import dotenv from 'dotenv';
import { Pool, PoolConfig } from "pg";

dotenv.config();

function getEnv(name: string): string {
  const value = process.env[name];
  
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  
  return value;
}

 
const baseConfig: PoolConfig = {
  host: getEnv("DB_HOST"),
  port: Number(getEnv("DB_PORT") || 5432),
  user: getEnv("DB_USER"),
  password: getEnv("DB_PASSWORD")
};

export const adminPool = new Pool({
  ...baseConfig,
  database: getEnv("DB_ADMIN_DATABASE")
});

export const appPool = new Pool({
  ...baseConfig,
  database: getEnv("DB_NAME")
});
