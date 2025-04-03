import { sql } from "drizzle-orm";
import {
    text,
    integer,
    sqliteTable,
    primaryKey,
} from "drizzle-orm/sqlite-core";

export const news = sqliteTable("news", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    timestamp: text("timestamp")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
});

export const help = sqliteTable("help", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    timestamp: text("timestamp")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    title: text("title").notNull().unique(),
    content: text("content").notNull(),
});

export const faq = sqliteTable("faq", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    timestamp: text("timestamp")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    title: text("title").notNull().unique(),
    content: text("content").notNull(),
});

export const private_phylomes = sqliteTable("private_phylomes", {
    phylome_id: integer("phylome_id", { mode: "number" }).primaryKey({}),
});

export const phylomes_allowed_users = sqliteTable(
    "phylomes_allowed_users",
    {
        user_email_address: text("user_email_address").notNull(),
        phylome_id: integer("phylome_id").notNull(),
        user_full_name: text("user_full_name"),
    },
    (table) => {
        return {
            pk: primaryKey({
                name: "relation_pk",
                columns: [table.user_email_address, table.phylome_id],
            }),
        };
    },
);
