import dotenv from 'dotenv';
import { Pool, PoolConfig } from "pg";

dotenv.config();

//we simply input the name of the var we want and we extract its value
function getEnv(name: string): string {
  const value = process.env[name];
  
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  
  return value;
}

 
// we create the basic config which is the same regardless if the database exists or not yet
const baseConfig: PoolConfig = {
  host: getEnv("DB_HOST"),
  port: Number(getEnv("DB_PORT") || 5432),
  user: getEnv("DB_USER"),
  password: getEnv("DB_PASSWORD")
};

// we connect to the administrative db from where we check if our project's db exists or we have to create it
export const adminPool = new Pool({
  ...baseConfig,
  database: getEnv("DB_ADMIN_DATABASE")
});

// used to connect to our project's db
export const appPool = new Pool({
  ...baseConfig,
  database: getEnv("DB_NAME")
});