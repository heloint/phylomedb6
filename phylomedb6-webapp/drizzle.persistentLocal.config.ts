import type { Config } from "drizzle-kit";

export default {
    dialect: "sqlite", // "postgresql" | "mysql"
    dbCredentials: {
        url: "./persistentLocal.db",
    },
    schema: "./src/persistentLocalDb/persistentLocalSchema.ts",
} satisfies Config;
