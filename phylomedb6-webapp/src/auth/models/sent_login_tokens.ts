import localDb from "@/localDb";
import { sent_login_tokens } from "@/localDb/localSchema";
import { eq, sql } from "drizzle-orm";

export type LoginAndSessionOptions = {
    email: string;
    token: string;
};

export type LoginData = {
    login_token_id: number;
    target_email_address: string;
    generated_token: string;
    timestamp: string;
};

export async function insertLoginData(
    params: LoginAndSessionOptions,
): Promise<{}> {
    const result = await localDb
        .insert(sent_login_tokens)
        .values({
            target_email_address: params.email,
            generated_token: params.token,
        })
        .onConflictDoUpdate({
            target: sent_login_tokens.target_email_address,
            set: {
                generated_token: params.token,
                timestamp: sql`CURRENT_TIMESTAMP`,
            },
        })
        .returning({ insertedId: sent_login_tokens.login_token_id });
    return result[0];
}

export async function getLoginData(token: string): Promise<LoginData> {
    const result = await localDb
        .select()
        .from(sent_login_tokens)
        .where(eq(sent_login_tokens.generated_token, token))
        .limit(1);
    const data = result[0];

    return data;
}
