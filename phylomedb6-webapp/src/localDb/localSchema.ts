import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const history = sqliteTable("history", {
    search_id: integer("search_id", { mode: "number" }).primaryKey({
        autoIncrement: true,
    }),
    search_type: text("search_type").notNull(),
    input_data: text("input_data").notNull(),
    timestamp: text("timestamp")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    user_email_address: text("user_email_address").notNull(),
});

export const sent_login_tokens = sqliteTable("sent_login_tokens", {
    login_token_id: integer("login_token_id", { mode: "number" }).primaryKey({
        autoIncrement: true,
    }),
    target_email_address: text("target_email_address").notNull().unique(),
    generated_token: text("generated_token").notNull().unique(),
    timestamp: text("timestamp")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
});

export const login_sessions = sqliteTable("login_sessions", {
    session_id: integer("session_id", { mode: "number" }).primaryKey({
        autoIncrement: true,
    }),
    user_email_address: text("user_email_address").notNull().unique(),
    session_token: text("session_token").notNull().unique(),
    timestamp: text("timestamp")
        .notNull()

        .default(sql`CURRENT_TIMESTAMP`),
});

export const admin_users = sqliteTable("admin_users", {
    user_id: integer("user_id", { mode: "number" }).primaryKey({
        autoIncrement: true,
    }),
    admin_email: text("admin_email").notNull().unique(),
    admin_fullname: text("admin_fullname").notNull(),
});
