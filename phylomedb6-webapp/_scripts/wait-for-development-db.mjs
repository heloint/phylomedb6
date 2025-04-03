import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: "./.env.development" });
} else if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: "./.env.production" });
} else {
    dotenv.config({ path: "./.env.local" });
}

// sleep time expects milliseconds
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

(async function main() {
    const retryTimeGap = 5 * 1000; // milliseconds (val.: 5 seconds)
    const timeoutLimit = 60 * 60 * 1000; // milliseconds (val.: 1 hour)
    const startTime = new Date();
    let retryCount = 0;
    while ((await checkDatabase()) === false) {
        if (new Date() - startTime > timeoutLimit) {
            throw Error(
                `==> [ERROR] Database is taking too long to connect. Timeout Limit: ${timeoutLimit}!`,
            );
        }
        retryCount++;

        await sleep(retryTimeGap);
    }
})();

async function checkDatabase() {
    try {
        const connection = await mysql.createConnection({
            user: process.env["DB_USER"],
            password: process.env["DB_PASS"],
            host: process.env["DB_HOST"],
            port: process.env["DB_PORT"],
            database: process.env["DB_DATABASE"],
        });
        const [results, _fields] = await connection.query("show tables;");
        if (results.length < 1) {
            throw Error("phylomedb6 database is empty!");
        }
        connection.end();
        return true;
    } catch (err) {
        return false;
    }
}
