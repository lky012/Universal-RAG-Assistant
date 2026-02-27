import { NextRequest, NextResponse } from "next/server";
import { findDemoAnswer, DEMO_QA } from "@/lib/demoData";

export async function POST(req: NextRequest) {
    try {
        const { question } = await req.json();
        if (!question?.trim()) {
            return NextResponse.json({ error: "Question required" }, { status: 400 });
        }

        const matched = findDemoAnswer(question);

        if (matched) {
            return NextResponse.json({
                answer: matched.answer,
                sources: matched.sources,
                demo: true,
            });
        }

        // Graceful fallback for unmatched questions
        const fallback = `This is a **demo mode** response using pre-loaded data from the HK I&T Blueprint.

Your question: *"${question}"*

I don't have a pre-set answer for this specific question in demo mode. Here are some questions I can answer well:

${DEMO_QA.slice(0, 5)
                .map((qa) => `- ${qa.question}`)
                .join("\n")}

To ask any question about your own documents, please switch to **BYOK Mode** and provide your own API key.`;

        return NextResponse.json({
            answer: fallback,
            sources: [],
            demo: true,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Demo failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
