import type { Config } from "drizzle-kit";

export default {
    dialect: "sqlite", // "postgresql" | "mysql"
    dbCredentials: {
        url: "./local.db",
    },
    schema: "./src/localDb/localSchema.ts",
} satisfies Config;
