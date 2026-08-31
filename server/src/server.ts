import "dotenv/config";
import app from "./app";
import { setupDb } from "./db/initialize";
import { adminPool, appPool } from "./config/database";

export type StartupMode = "empty" | "resume" | "demo";
let startMode =  process.argv[2] || "resume";

async function main() {
  const startArray = ["empty", "resume", "demo"];

  if(!startArray.includes(startMode)){
    console.log("\nThe program has to be initiated with either\n-- empty -> for a setup with no bookings or users\n-- resume -> for a setup with unchanged data since last session(if last session doesnt exist it will start with empty)\n-- demo -> for a setup with pre-made set of data\nIf no parameter then default is -- resume");
    process.exit(1);
  }


  startMode = await setupDb(startMode as StartupMode);

  console.log(`Current process mode: ${startMode}`);

  const PORT = Number(process.env.PORT) || 5000;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main();

