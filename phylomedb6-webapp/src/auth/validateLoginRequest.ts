"use server";

import { insertSessionData, SessionData } from "./models/login_sessions";
import { v4 } from "uuid";

import * as dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: "./.env.development" });
}

import {
    getLoginData,
    LoginAndSessionOptions,
    LoginData,
} from "./models/sent_login_tokens";
import { cookies } from "next/headers";

function handleError(message: string) {
    return { error: true, message };
}

function validateToken(tokenCreationTime: string) {
    const timeCurrent = new Date();
    const timeTokenCreated = new Date(tokenCreationTime);
    const timeDifference = timeCurrent.getTime() - timeTokenCreated.getTime();
    if (timeDifference <= 900000) {
        return true;
    } else {
        return false;
    }
}

function createSessionData(loginData: LoginData): LoginAndSessionOptions {
    const newSessionData: LoginAndSessionOptions = {
        email: loginData.target_email_address,
        token: v4(),
    };
    return newSessionData;
}

async function createSession(params: LoginAndSessionOptions) {
    try {
        const result = await insertSessionData(params);
        if (!result) {
            return handleError("Error inserting session data");
        }

        return createCookie(params.token);
    } catch (err) {
        return handleError("Error during session creation");
    }
}

function createCookie(token: string) {
    try {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        cookies().set("token", token, {
            httpOnly: true,
            secure: true,
            expires: expiresAt,
            sameSite: "lax",
            path: "/",
        });
        return { error: false, message: "Cookie created" };
    } catch (err) {
        return handleError("Error during cookie creation");
    }
}

function createTestSessionData(): LoginAndSessionOptions {
    return {
        email: process.env.TEST_USER_EMAIL || "test@gmail.com",
        token: v4(),
    };
}

export async function validateLoginRequest(tokenFromUrl: string) {
    // 1. Receive the token from the URL and log it for debugging purposes.
    try {
        if (
            process.env.NODE_ENV === "development" &&
            tokenFromUrl === process.env.TEST_USER_TOKEN
        ) {
            // Create test session directly without validation
            const testSessionData = createTestSessionData();
            return await createSession(testSessionData);
        }

        // 2. Find if login data exists in the database associated with the token.
        const loginData = await getLoginData(tokenFromUrl);

        // 3. Check if the login data was found; if not, return an error.
        if (!loginData) {
            return handleError("Login data not found");
        }

        // 4. Check if the generated token from login data is valid.
        const tokenValidationResult = validateToken(loginData.timestamp);

        // 5.If the token is not valid, return an error response.
        if (!tokenValidationResult) {
            return handleError("Token is not valid");
        }

        // 6. Create session data if the token is valid.
        const sessionData = createSessionData(loginData);

        // 7. Save the new session data and log the result.
        const resultInsertSessionData = await createSession(sessionData);

        // 8. Return the result of the session insertion process.
        return resultInsertSessionData;
    } catch (err) {
        // 9.Handle any errors that occur during the login request processing.
        return handleError("An error occurred during the login request");
    }
}
