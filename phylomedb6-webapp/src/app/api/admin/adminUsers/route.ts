import { NextRequest, NextResponse } from "next/server";
import {
    getAllAdminUsers,
    addAdminUser,
    deleteAdminUser,
    updateAdminEmail,
    updateAdminFullname,
} from "@/app/admin/_models/manageAdminUsers";

import {
    checkIsAuthenticated,
    checkIsAuthenticatedAsAdmin,
} from "@/auth/checkSession";

export async function POST(request: NextRequest) {
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    const isAuthenticated = await checkIsAuthenticated();

    if (!isAdmin || !isAuthenticated) {
        return NextResponse.json(
            { error: "Not enough permissions." },
            { status: 401 },
        );
    }

    try {
        const { admin_email, admin_fullname } = await request.json();

        if (!admin_email || !admin_fullname) {
            return NextResponse.json(
                { error: "Missing admin_email or admin_fullname" },
                { status: 400 },
            );
        }

        await addAdminUser(admin_email, admin_fullname);
        return NextResponse.json({
            message: "Admin user added successfully",
            status: 200,
        });
    } catch (error) {
        console.error("Error adding admin user:", error);
        return NextResponse.json(
            { error: "Error adding admin user" },
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

    try {
        const adminUsers = await getAllAdminUsers();
        return NextResponse.json({
            data: adminUsers,
            message: "Admin users retrieved successfully",
            status: 200,
        });
    } catch (error) {
        console.error("Error retrieving admin users:", error);
        return NextResponse.json(
            { error: "Error retrieving admin users" },
            { status: 500 },
        );
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

    try {
        const { searchParams } = new URL(request.url);
        const userIdParam = searchParams.get("user_email");
        console.log(userIdParam);
        if (!userIdParam) {
            return NextResponse.json(
                { error: "Missing user_id parameter" },
                { status: 400 },
            );
        }

        const userIds = JSON.parse(decodeURIComponent(userIdParam));

        // Handle both single ID and array of IDs
        const idsToDelete = Array.isArray(userIds) ? userIds : [userIds];

        for (const id of idsToDelete) {
            await deleteAdminUser(id);
        }

        return NextResponse.json({
            message: "Admin user(s) deleted successfully",
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting admin user(s):", error);
        return NextResponse.json(
            { error: "Error deleting admin user(s)" },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest) {
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    const isAuthenticated = await checkIsAuthenticated();

    if (!isAdmin || !isAuthenticated) {
        return NextResponse.json(
            { error: "Not enough permissions." },
            { status: 401 },
        );
    }
    const { user_id, admin_email, admin_fullname } = await request.json();
    try {
        if (!user_id) {
            return NextResponse.json(
                { error: "Missing user_id" },
                { status: 400 },
            );
        }

        if (!admin_email && !admin_fullname) {
            return NextResponse.json(
                { error: "Missing update fields" },
                { status: 400 },
            );
        }

        // Get current user to verify it exists
        const users = await getAllAdminUsers();
        const userExists = users.some((user) => user.user_id === user_id);

        if (!userExists) {
            return NextResponse.json(
                { error: "Admin user not found" },
                { status: 404 },
            );
        }

        // Perform updates
        if (admin_email) {
            await updateAdminEmail(user_id, admin_email);
        }
        if (admin_fullname) {
            await updateAdminFullname(user_id, admin_fullname);
        }

        return NextResponse.json({
            message: `Admin user ${admin_email} updated successfully`,
            status: 200,
        });
    } catch (error: any) {
        if (
            error.message.includes(
                "UNIQUE constraint failed: admin_users.admin_email",
            )
        ) {
            return NextResponse.json(
                {
                    error: `Email ${admin_email} already exists`,
                },
                { status: 400 },
            );
        }

        return NextResponse.json({
            error: `Error updating admin user: ${admin_email} error: ${error.message}`,
            status: 500,
        });
    }
}
