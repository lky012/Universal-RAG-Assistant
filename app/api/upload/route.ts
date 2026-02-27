import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession, createSession, updateSession, AIProvider } from "@/lib/sessionStore";
import { ingestDocuments, addDocumentsToStore } from "@/lib/ragEngine";

export const maxDuration = 60;

async function extractText(buffer: Buffer, filename: string): Promise<string> {
    if (filename.toLowerCase().endsWith(".pdf")) {
        const pdf = await import("pdf-parse");
        // Handle pdf-parse v2 class-based API
        const PDFClass = (pdf as any).PDFParse || (pdf as any).default?.PDFParse || pdf;
        const parser = new PDFClass({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        return result.text;
    }
    if (filename.toLowerCase().endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }
    return buffer.toString("utf-8");
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const apiKey = formData.get("apiKey") as string;
        const provider = (formData.get("provider") as AIProvider) || "openai";
        let sessionId = formData.get("sessionId") as string;

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
        if (!apiKey) return NextResponse.json({ error: "No API key provided" }, { status: 400 });
        if (file.size > 15 * 1024 * 1024)
            return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 413 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await extractText(buffer, file.name);

        if (!text.trim())
            return NextResponse.json({ error: "Could not extract text from file" }, { status: 422 });

        let session = sessionId ? getSession(sessionId) : null;
        if (!session) {
            sessionId = uuidv4();
            session = createSession(sessionId, provider, apiKey);
        }

        let chunkCount: number;

        if (session.vectorStore) {
            const result = await addDocumentsToStore(
                session.vectorStore, text, file.name, provider, apiKey
            );
            chunkCount = result.chunkCount;
            updateSession(sessionId, { files: [...session.files, file.name] });
        } else {
            const result = await ingestDocuments(text, file.name, provider, apiKey);
            updateSession(sessionId, {
                vectorStore: result.store,
                files: [file.name],
                provider,
                apiKey,
            });
            chunkCount = result.chunkCount;
        }

        const updated = getSession(sessionId)!;
        return NextResponse.json({ success: true, sessionId, chunkCount, totalFiles: updated.files });
    } catch (err: unknown) {
        console.error("Upload error:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
    }
}
