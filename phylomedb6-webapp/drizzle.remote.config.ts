import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: "./.env.development" });
} else if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: "./.env.production" });
} else {
    dotenv.config({ path: "./.env.local" });
}

export default defineConfig({
    schema: "./src/remoteDb/remoteSchema.ts",
    out: "./src/remoteDb/",
    dialect: "mysql",
    dbCredentials: {
        url: `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
    },
});
