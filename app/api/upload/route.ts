import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession, createSession, updateSession, AIProvider } from "@/lib/sessionStore";
import { ingestDocuments, addDocumentsToStore } from "@/lib/ragEngine";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const text = formData.get("text") as string;
        const filename = formData.get("filename") as string;
        const apiKey = formData.get("apiKey") as string;
        const provider = (formData.get("provider") as AIProvider) || "openai";
        let sessionId = formData.get("sessionId") as string;

        if (!text) return NextResponse.json({ error: "No text content provided" }, { status: 400 });
        if (!apiKey) return NextResponse.json({ error: "No API key provided" }, { status: 400 });

        let session = sessionId ? getSession(sessionId) : null;
        if (!session) {
            sessionId = uuidv4();
            session = createSession(sessionId, provider, apiKey);
        }

        let chunkCount: number;

        if (session.vectorStore) {
            const result = await addDocumentsToStore(
                session.vectorStore, text, filename, provider, apiKey
            );
            chunkCount = result.chunkCount;
            updateSession(sessionId, { files: [...session.files, filename] });
        } else {
            const result = await ingestDocuments(text, filename, provider, apiKey);
            updateSession(sessionId, {
                vectorStore: result.store,
                files: [filename],
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
