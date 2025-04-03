import { NextRequest, NextResponse } from "next/server";
import {
    addNameByEmail,
    addPhylomeByEmailAndId,
    deleteAllRowsByEmail,
    getEmailsByPhylomeId,
    removePhylomeByEmailAndId,
    updateEmailByPhylomeId,
    updateUserDataAcrossPhylomes,
} from "../../../../_models/admin/phylomes/privatePhylomesRelations";

import {
    checkIsAuthenticated,
    checkIsAuthenticatedAsAdmin,
} from "@/auth/checkSession";

export type PhylomeAllowedUserData = {
    user_email_address: string;
    phylome_id: string;
};

// GET: Get emails by phylome_id
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
    const phylomeIdsParam = searchParams.get("phylome_ids");
    if (!phylomeIdsParam) {
        return NextResponse.json(
            { error: "Invalid query param in GET url!" },
            { status: 401 },
        );
    }

    const phylomeIds: number[] = JSON.parse(phylomeIdsParam);

    if (!phylomeIds || phylomeIds.length < 1) {
        return NextResponse.json(
            { error: "Missing phylome_id parameter" },
            { status: 400 },
        );
    }

    try {
        const emails = await getEmailsByPhylomeId(phylomeIds);
        return NextResponse.json(emails);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching emails" },
            { status: 500 },
        );
    }
}

// POST: Add a new phylome by email and phylome_id
export async function POST(request: NextRequest) {
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    const isAuthenticated = await checkIsAuthenticated();

    if (!isAdmin && !isAuthenticated) {
        return NextResponse.json(
            { error: "Not enough permissions." },
            { status: 401 },
        );
    }

    let errorText = "";
    try {
        const { user_email_address, phylome_id, new_email, new_name } =
            await request.json();

        if (user_email_address && phylome_id && !new_email) {
            errorText = "Error adding phylome";
            return addPhylomeByEmailAndIdPOST(user_email_address, phylome_id);
        } else if (new_email && phylome_id) {
            errorText = "Error updating email";
            return updatePhylomeByEmailAndIdPOST(
                user_email_address,
                phylome_id,
                new_email,
            );
        }

        if (user_email_address && new_email) {
            errorText = "Email already exisiting";
            return editAllUserDataPOST(user_email_address, new_email, new_name);
        }

        if (user_email_address) {
            let errorText = "Error adding name";
            return addNameByMailPOST(new_name, user_email_address);
        }
        return NextResponse.json({ error: errorText }, { status: 777 });
    } catch (error) {
        return NextResponse.json({ error: errorText }, { status: 500 });
    }
}

async function editAllUserDataPOST(
    user_email_address: string,
    new_email: string,
    new_name: string,
) {
    let resp = await updateUserDataAcrossPhylomes(
        user_email_address,
        new_email,
        new_name,
    );
    console.log(resp);
    console.log("hola");
    return NextResponse.json({
        message: `Name ${new_name} and email ${new_email} modified successfully `,
    });
}

async function addNameByMailPOST(new_name: string, user_email_address: string) {
    await addNameByEmail(new_name, user_email_address);
    return NextResponse.json({
        message: `Name ${new_name} added successfully to ${user_email_address}`,
    });
}

async function addPhylomeByEmailAndIdPOST(
    user_email_address: string,
    phylome_id: number,
) {
    await addPhylomeByEmailAndId(user_email_address, phylome_id);
    return NextResponse.json({ message: "Phylome added successfully" });
}

async function updatePhylomeByEmailAndIdPOST(
    user_email_address: string,
    phylome_id: number,
    new_email: string,
) {
    let response = await updateEmailByPhylomeId(
        user_email_address,
        new_email,
        phylome_id,
    );
    return NextResponse.json({ message: "Email modified successfully" });
}

// DELETE: Remove a phylome by email and phylome_id
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
    const user_email_address = searchParams.get("user_email_address");
    const phylome_id = searchParams.get("phylome_id");

    try {
        if (user_email_address && phylome_id) {
            await removePhylomeByEmailAndId(
                user_email_address,
                parseInt(phylome_id),
            );
            return NextResponse.json({
                message: `Phylome ${phylome_id} removed successfully`,
            });
        }

        if (user_email_address) {
            await deleteAllRowsByEmail(user_email_address);
            return NextResponse.json({
                message: `User ${user_email_address} removed successfully`,
            });
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Error deleting action" },
            { status: 500 },
        );
    }
}
