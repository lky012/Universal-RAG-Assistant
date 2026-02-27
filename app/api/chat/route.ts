import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/sessionStore";
import { runRAGQuery } from "@/lib/ragEngine";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { question, sessionId } = body;

        if (!question?.trim()) {
            return NextResponse.json({ error: "Question is required" }, { status: 400 });
        }
        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        const session = getSession(sessionId);
        if (!session) {
            return NextResponse.json(
                { error: "Session expired. Please upload your document again." },
                { status: 404 }
            );
        }
        if (!session.vectorStore) {
            return NextResponse.json(
                { error: "No documents found. Please upload a file first." },
                { status: 422 }
            );
        }

        const { answer, sources } = await runRAGQuery(question, session);

        // Persist conversation history
        updateSession(sessionId, {
            history: [
                ...session.history,
                { role: "human", content: question },
                { role: "ai", content: answer },
            ],
        });

        return NextResponse.json({ answer, sources });
    } catch (err: unknown) {
        console.error("Chat error:", err);
        const message = err instanceof Error ? err.message : "Chat failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
