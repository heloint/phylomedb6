import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type RouteParams = {
    imgName: string;
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteParams> },
) {
    const receivedParams = await params;
    const imgName: string = receivedParams.imgName;
    const uploadedImgFilePath = path.join(
        process.cwd(),
        "public",
        "post-images",
        imgName,
    );
    const imgFileContent = fs.readFileSync(uploadedImgFilePath);
    return new NextResponse(imgFileContent, {
        status: 200,
        headers: new Headers({ "content-type": "image/png" }),
    });
}
