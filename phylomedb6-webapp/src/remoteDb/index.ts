import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
    keepAliveInitialDelay: 10000,
    enableKeepAlive: true,
});

const remoteDb = drizzle(connection);
export default remoteDb;
