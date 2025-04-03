import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("local.db");
const localDb = drizzle(sqlite);
export default localDb;
