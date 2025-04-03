"use server";

import { cookies } from "next/headers";
import { getSessionData, SessionData } from "./models/login_sessions";
import { AdminData, getAdminData } from "./models/admin_users";

export async function checkIsAuthenticated(): Promise<SessionData | null> {
    const token = cookies().get("token")?.value;
    if (!token) {
        return null;
    }
    const session = await getSessionData(token);
    if (!session) {
        return null;
    }
    return session;
}

export async function checkIsAdmin(email: string): Promise<AdminData | null> {
    const admin = await getAdminData(email);
    if (!admin) {
        return null;
    }
    return admin;
}

export async function checkIsAuthenticatedAsAdmin(): Promise<boolean> {
    const session = await checkIsAuthenticated();
    if (!session) {
        return false;
    }
    const admin = await checkIsAdmin(session.user_email_address);
    if (!admin) {
        return false;
    }
    return true;
}
