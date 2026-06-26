import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // These will be used in later phases
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  secret: process.env.AUDIT_SECRET_KEY,
};

// Validate required config
export function validateConfig(): void {
  const warnings: string[] = [];

  if (!process.env.PORT) {
    warnings.push("PORT not set, using default 3000");
  }

  // Will add more validation in later phases
  if (warnings.length > 0) {
    console.warn("Configuration warnings:");
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}
