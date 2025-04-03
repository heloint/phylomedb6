import localDb from "@/localDb";
import { admin_users } from "@/localDb/localSchema";
import { eq } from "drizzle-orm";

export type AdminUserData = {
    user_id: number;
    admin_email: string;
    admin_fullname: string;
};

export async function getAllAdminUsers(): Promise<AdminUserData[]> {
    const result = await localDb.select().from(admin_users);
    return result;
}

export async function addAdminUser(
    admin_email: string,
    admin_fullname: string,
) {
    await localDb.insert(admin_users).values({
        admin_email,
        admin_fullname,
    });
}

export async function deleteAdminUser(user_email_address: string) {
    console.log(user_email_address);
    const result = await localDb
        .delete(admin_users)
        .where(eq(admin_users.admin_email, user_email_address));
}

export async function updateAdminEmail(user_id: number, new_email: string) {
    const result = await localDb
        .update(admin_users)
        .set({ admin_email: new_email })
        .where(eq(admin_users.user_id, user_id));
}

export async function updateAdminFullname(
    user_id: number,
    new_fullname: string,
) {
    const result = await localDb
        .update(admin_users)
        .set({ admin_fullname: new_fullname })
        .where(eq(admin_users.user_id, user_id));
}
