import { adminPool, appPool } from "../config/database";
import { StartupMode } from "../server";
import { runMigrations } from "./migrate";
import { resetDb } from "./reset";
import { seedBasicDb, seedDemoDb } from "./seed";

export async function doesDbExist(mode: StartupMode): Promise<StartupMode>  {
  // console.log(appPool.options.database);
  // console.log(process.env.DB_NAME);

  const dbName = appPool.options.database!; //simplify the db name, ! points out im certain the value exists


  // we check if db exists
  const result = await adminPool.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );

  // we use ${} because $1 is for values, not identifiers
  if (result.rowCount === 0) {
    await adminPool.query(
      `CREATE DATABASE ${dbName}`
    ); 

    console.log(`Created database: ${dbName}`);
    console.log("Mode auto set to empty");
    if(mode === "resume"){
      mode = "empty";
      console.log("--Now running as 'empty' since DB did not exist");
    } // we cannot resume in a database that doesnt exist
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

  if(mode !== "resume"){//if we have empty or demo i have to empty the db and setup the environment
    await resetDb(); // i empty all tables from the data
    await seedBasicDb(); // i import the template of rooms, types, amenities etc.
    if(mode === "demo") await seedDemoDb(); // i import the demo users/bookings etc to simulate real non-empty example
  }

  return mode;
}