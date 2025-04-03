import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import { createHash } from "crypto";

async function saveFileIntoDir(file: File, outputDir: string): Promise<string> {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256");
    hash.update(buffer);
    const fileHash = hash.digest("hex");

    const fileExtension = path.extname(file.name);
    const newFileName = `${fileHash}${fileExtension}`;
    const newFilePath = path.join(outputDir, newFileName);

    await writeFile(newFilePath, buffer);
    return newFileName;
}

export async function POST(request: Request) {
    const formData = await request.formData();
    const uploadDir = path.join(process.cwd(), "public", "post-images");
    const file = formData.get("file") as File | null;
    if (!file || !file.type.startsWith("image")) {
        return NextResponse.json(
            { error: "No file was found in POST request!" },
            { status: 400 },
        );
    }
    try {
        const newFileName = await saveFileIntoDir(file, uploadDir);
        return NextResponse.json(
            { imgRoute: `/api/uploaded-images/${newFileName}` },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "An internal error has occured during file upload!" },
            { status: 500 },
        );
    }
}
