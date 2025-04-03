import { NextRequest, NextResponse } from "next/server";
import { getGeneRowData } from "./_models/genes";

export async function GET(
    request: NextRequest,
    { params }: { params: { geneSearchValue: string } },
) {
    try {
        const data = await getGeneRowData(params.geneSearchValue);
        const result = data.flat();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching data" },
            { status: 500 },
        );
    }
}
