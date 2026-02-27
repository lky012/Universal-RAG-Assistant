import { NextRequest, NextResponse } from "next/server";
import { resetSession } from "@/lib/sessionStore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        resetSession(sessionId);
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Reset error:", err);
        const message = err instanceof Error ? err.message : "Reset failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
