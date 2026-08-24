import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = new URL(String(process.env["NITRO_DATABASE_URL"]));
const dbCredentials = {
  database: url.pathname.substring(1),
  host: url.hostname,
  password: url.password,
  user: url.username,
  port: Number(url.port),
  ssl: url.searchParams.has("sslmode", "require"),
};
export default defineConfig({
  dialect: "postgresql",
  dbCredentials,
  out: "./server/assets/drizzle",
  schema: [
    "./server/utils/db/auth/auth-schema.ts",
    "./server/utils/db/schema.ts",
  ],
});
