import localDb from "@/localDb";
import { admin_users } from "@/localDb/localSchema";
import { eq } from "drizzle-orm";

export type AdminData = {
    user_id: number;
    admin_email: string;
    admin_fullname: string;
};

export async function getAdminData(email: string): Promise<AdminData | null> {
    const result = await localDb
        .select()
        .from(admin_users)
        .where(eq(admin_users.admin_email, email))
        .limit(1);
    const data = result[0];

    return data;
}
