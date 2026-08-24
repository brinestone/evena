import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { useDatabase } from "../db";
import * as schema from "../db/auth/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(useDatabase(), { provider: "pg", schema }),
  socialProviders: {},
});
