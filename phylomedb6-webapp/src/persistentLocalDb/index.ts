import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("persistentLocal.db");
const persistentLocalDb = drizzle(sqlite);
export default persistentLocalDb;
