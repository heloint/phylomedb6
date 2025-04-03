import { NextRequest, NextResponse } from "next/server";
import {
    deleteHistoryOption,
    addHistoryOption,
} from "@/_models/history/history";
import { checkIsAuthenticated } from "@/auth/checkSession";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { searchId: string } },
) {
    try {
        const { deleted, count } = await deleteHistoryOption(params.searchId);
        if (!deleted) {
            return NextResponse.json(
                { error: "No entries found to delete" },
                { status: 404 },
            );
        }
        return NextResponse.json({
            message: `${count} entry(ies) deleted successfully`,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Error deleting history entry" },
            { status: 500 },
        );
    }
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const isLoggedIn = await checkIsAuthenticated();
    const searchGeneValue = url.searchParams.get("searchGeneValue");
    const searchSequenceValue = url.searchParams.get("searchSequenceValue");
    try {
        if (searchGeneValue && isLoggedIn) {
            await addHistoryOption(
                "gene",
                searchGeneValue,
                isLoggedIn.user_email_address,
            );
            return NextResponse.json({ message: `Data added successfully` });
        } else if (!searchSequenceValue) {
            return NextResponse.json(
                { error: "No gene value found , no added data." },
                { status: 404 },
            );
        }

        if (searchSequenceValue && isLoggedIn) {
            await addHistoryOption(
                "sequence",
                searchSequenceValue,
                isLoggedIn.user_email_address,
            );
            return NextResponse.json({ message: `Data added successfully` });
        } else if (!searchGeneValue) {
            return NextResponse.json(
                { error: "No sequence value found , no added data." },
                { status: 404 },
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Error adding data to history table" },
            { status: 500 },
        );
    }
}
