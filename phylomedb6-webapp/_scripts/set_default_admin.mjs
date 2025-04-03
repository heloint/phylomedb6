import Database from "better-sqlite3";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: "./.env.development" });
} else if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: "./.env.production" });
} else {
    dotenv.config({ path: "./.env.local" });
}

(async function register() {
    const admin_email_default = process.env["EMAIL_USER_ADMIN"];
    const admin_full_name = process.env["FULLNAME_USER_ADMIN"];

    if (!admin_email_default || !admin_full_name) {
        console.log("Error env variables not defined.. exit code (1) ");
        return;
    }
    const sqlite_db = new Database("local.db");
    const insert_statement = sqlite_db.prepare(
        "INSERT OR IGNORE INTO admin_users(admin_email, admin_fullname) VALUES (?, ?)",
    );
    insert_statement.run(admin_email_default, admin_full_name);

    if (process.env.NODE_ENV === "development") {
        const test_email = process.env["TEST_USER_EMAIL"];
        const test_name = process.env["TEST_USER_NAME"];

        const test_insert_statement = sqlite_db.prepare(
            "INSERT OR IGNORE INTO admin_users(admin_email, admin_fullname) VALUES (?, ?)",
        );
        test_insert_statement.run(test_email, test_name);
    }
})();
