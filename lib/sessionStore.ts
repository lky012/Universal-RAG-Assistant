import { SimpleVectorStore } from "./ragEngine";

export type AIProvider = "openai" | "gemini";

export interface ChatMessage {
    role: "human" | "ai";
    content: string;
}

export interface SessionData {
    vectorStore: SimpleVectorStore | null;
    history: ChatMessage[];
    provider: AIProvider;
    apiKey: string;
    files: string[];
    createdAt: number;
}

const globalForSessions = global as unknown as {
    sessionMap: Map<string, SessionData>;
};

if (!globalForSessions.sessionMap) {
    globalForSessions.sessionMap = new Map<string, SessionData>();
}

const sessionMap = globalForSessions.sessionMap;
const SESSION_TTL_MS = 30 * 60 * 1000;

export function getSession(sessionId: string): SessionData | undefined {
    const s = sessionMap.get(sessionId);
    if (!s) return undefined;
    if (Date.now() - s.createdAt > SESSION_TTL_MS) {
        sessionMap.delete(sessionId);
        return undefined;
    }
    return s;
}

export function createSession(sessionId: string, provider: AIProvider, apiKey: string): SessionData {
    const s: SessionData = {
        vectorStore: null,
        history: [],
        provider,
        apiKey,
        files: [],
        createdAt: Date.now(),
    };
    sessionMap.set(sessionId, s);
    return s;
}

export function updateSession(sessionId: string, data: Partial<SessionData>) {
    const s = sessionMap.get(sessionId);
    if (!s) return;
    sessionMap.set(sessionId, { ...s, ...data });
}

export function resetSession(sessionId: string) {
    const s = sessionMap.get(sessionId);
    if (!s) return;
    sessionMap.set(sessionId, { ...s, vectorStore: null, history: [], files: [], createdAt: Date.now() });
}

export function deleteSession(sessionId: string) {
    sessionMap.delete(sessionId);
}
