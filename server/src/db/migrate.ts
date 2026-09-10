import path from "node:path";
import { appPool } from "../config/database";

export async function runMigrations(): Promise<void> {
  const client = await appPool.connect();

  try {
    const { runner } = await import("node-pg-migrate");
    const appliedMigrations = await runner({
      dbClient: client,
      dir: path.resolve(process.cwd(), "migrations"),
      direction: "up",
      migrationsTable: "schema_migrations",
      checkOrder: true,
      verbose: false
    });

    if (appliedMigrations.length > 0) {
      console.log(`Applied migrations: ${appliedMigrations.map(({ name }) => name).join(", ")}`);
    }
  } finally {
    client.release();
  }
}
