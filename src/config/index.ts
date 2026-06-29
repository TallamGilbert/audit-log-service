import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "audit_log",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },

  secret: process.env.AUDIT_SECRET_KEY || "dev-secret",
};

export function validateConfig(): void {
  const errors: string[] = [];

  if (!process.env.DB_PASSWORD) {
    errors.push("DB_PASSWORD is not set");
  }

  if (config.nodeEnv === "production" && config.secret === "dev-secret") {
    errors.push("AUDIT_SECRET_KEY must be changed in production");
  }

  if (errors.length > 0) {
    console.error("Configuration errors:");
    errors.forEach((e) => console.error(`   ${e}`));
    process.exit(1);
  }
}
