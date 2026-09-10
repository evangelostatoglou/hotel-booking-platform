import { adminPool, appPool } from "../config/database";
import { StartupMode } from "../server";
import { runMigrations } from "./migrate";
import { resetDb } from "./reset";
import { seedBasicDb, seedDemoDb } from "./seed";

export async function doesDbExist(mode: StartupMode): Promise<StartupMode>  {
  const dbName = appPool.options.database!;

  const result = await adminPool.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );

  if (result.rowCount === 0) {
    await adminPool.query(
      `CREATE DATABASE ${dbName}`
    ); 

    console.log(`Created database: ${dbName}`);
    console.log("Mode auto set to empty");
    if(mode === "resume"){
      mode = "empty";
      console.log("--Now running as 'empty' since DB did not exist");
    }
  } else {
    console.log(`Database already exists: ${dbName}`);
  }

  await appPool.query("SELECT 1");
  console.log(`Connected to database: ${dbName}`);

  return mode;
}

export async function setupDb(mode: StartupMode) :Promise<StartupMode> {

  mode = await doesDbExist(mode);
  await runMigrations();

  if(mode !== "resume"){
    await resetDb();
    await seedBasicDb();
    if(mode === "demo") await seedDemoDb();
  }

  return mode;
}
