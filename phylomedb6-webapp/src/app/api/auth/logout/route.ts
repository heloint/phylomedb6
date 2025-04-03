import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSessionData } from "@/auth/models/login_sessions";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest, response: NextResponse) {
    try {
        const token_value = cookies().get("token")?.value;

        if (!token_value) {
            return NextResponse.json(
                { error: "Missing authentication cookies." },
                { status: 401 },
            );
        }
        const resultLogout = await deleteSessionData(token_value);

        cookies().delete("token");
        revalidatePath("/", "layout");
        return NextResponse.json(resultLogout);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching data" },
            { status: 500 },
        );
    }
}
