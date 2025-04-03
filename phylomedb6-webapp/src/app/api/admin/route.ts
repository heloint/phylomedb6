import { NextRequest, NextResponse } from "next/server";
import {
    deletePrivatePhylome,
    addPrivatePhylome,
} from "../../../_models/admin/privatePhylomesLocal";
import {
    checkIsAuthenticated,
    checkIsAuthenticatedAsAdmin,
} from "@/auth/checkSession";
import { PhylomesModel } from "../../../_models/admin/privatePhylomesRemote";

export type PhylomeAllowedUserData = {
    user_email_address: string;
    phylome_id: string;
};

export async function POST(request: NextRequest) {
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    const isAuthenticated = await checkIsAuthenticated();

    if (!isAdmin || !isAuthenticated) {
        return NextResponse.json(
            { error: "Not enough permissions." },
            { status: 401 },
        );
    }

    const { phylome_id } = await request.json();
    try {
        if (!phylome_id) {
            return NextResponse.json(
                { error: "Missing user_email_address or phylome_id" },
                { status: 400 },
            );
        }

        await addPrivatePhylome(phylome_id);
        return NextResponse.json({ message: "Phylome added successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    const isAuthenticated = await checkIsAuthenticated();

    if (!isAdmin || !isAuthenticated) {
        return NextResponse.json(
            { error: "Not enough permissions." },
            { status: 401 },
        );
    }

    const { searchParams } = new URL(request.url);
    const phylomeIdsRaw = searchParams.get("phylome_id");

    if (!phylomeIdsRaw) {
        return NextResponse.json(
            { error: "Missing phylome_id parameter" },
            { status: 400 },
        );
    }

    try {
        // Perform the deletion in the database
        const phylome_ids = JSON.parse(decodeURIComponent(phylomeIdsRaw));

        for (const phylome_id of phylome_ids) {
            await deletePrivatePhylome(phylome_id);
        }

        return NextResponse.json({ message: "Phylome removed successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Error deleting phylome" },
            { status: 500 },
        );
    }
}

export async function GET(request: NextRequest) {
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    const isAuthenticated = await checkIsAuthenticated();

    if (!isAdmin || !isAuthenticated) {
        return NextResponse.json(
            { error: "Not enough permissions." },
            { status: 401 },
        );
    }

    const { searchParams } = new URL(request.url);
    const phylomeIdRaw = searchParams.get("phylome_id");
    const userActRaw = searchParams.get("user_act");

    if (phylomeIdRaw && !userActRaw) {
        try {
            const phylome_id = parseInt(phylomeIdRaw);

            const exists = await PhylomesModel.existsPhylome(phylome_id);
            if (!exists) {
                return NextResponse.json(
                    { error: `Phylome with id ${phylome_id} does not exist` },
                    { status: 404 },
                );
            }

            const isPrivate = await PhylomesModel.isPhylomePrivate(phylome_id);

            return NextResponse.json({
                message: `${isPrivate ? `The phylome ${phylome_id} is private` : `The phylome ${phylome_id} is public and cannot be added`}`,
                isPrivate,
            });
        } catch (error) {
            return NextResponse.json(
                { error: "Error fetching phylome status" },
                { status: 500 },
            );
        }
    } else if (!phylomeIdRaw && userActRaw) {
        try {
            //PENDING TODO
        } catch (error) {
            return NextResponse.json({ error: "PENDING" }, { status: 500 });
        }
    } else {
        return NextResponse.json(
            { error: "Error doing GET request" },
            { status: 500 },
        );
    }
}
