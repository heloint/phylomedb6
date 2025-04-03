import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
    const res = await fetch(
        `http://localhost:5000/static/gui.html?tree=tree-1`,
        {
            method: "GET",
            next: { revalidate: 1800 },
        },
    );
    return res;
}
