import localDb from "@/localDb";
import { login_sessions } from "@/localDb/localSchema";
import { eq, sql } from "drizzle-orm";
import { LoginAndSessionOptions } from "./sent_login_tokens";

export type SessionData = {
    session_id: number;
    user_email_address: string;
    session_token: string;
    timestamp: string;
};

export async function insertSessionData(
    params: LoginAndSessionOptions,
): Promise<{}> {
    const result = await localDb
        .insert(login_sessions)
        .values({
            user_email_address: params.email,
            session_token: params.token,
        })
        .onConflictDoUpdate({
            target: login_sessions.user_email_address,
            set: {
                session_token: params.token,
                timestamp: sql`CURRENT_TIMESTAMP`,
            },
        })
        .returning({ insertedId: login_sessions.session_id });
    return result[0];
}

export async function getSessionData(
    token: string,
): Promise<SessionData | null> {
    const result = await localDb
        .select()
        .from(login_sessions)
        .where(eq(login_sessions.session_token, token))
        .limit(1);
    const data = result[0];

    return data;
}

export async function deleteSessionData(token: string): Promise<{}> {
    const result = await localDb
        .delete(login_sessions)
        .where(eq(login_sessions.session_token, token));
    const count = result.changes;
    const deleted = count > 0;

    return { deleted, count };
}
