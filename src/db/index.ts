import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "../config";

// Create PostgreSQL connection
const connectionString = `postgres://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`;

const client = postgres(connectionString);

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export for testing/health checks
export { client };
