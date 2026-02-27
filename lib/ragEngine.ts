import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { AIProvider, SessionData, ChatMessage } from "./sessionStore";

// ── Simple in-memory vector store (cosine similarity) ─────────────────────────
interface VectorEntry {
    vector: number[];
    doc: Document;
}

export class SimpleVectorStore {
    private entries: VectorEntry[] = [];

    addVectors(vectors: number[][], docs: Document[]): void {
        for (let i = 0; i < docs.length; i++) {
            this.entries.push({ vector: vectors[i], doc: docs[i] });
        }
    }

    similaritySearch(queryVector: number[], k: number): Document[] {
        if (this.entries.length === 0) return [];
        const scored = this.entries.map((e) => ({
            doc: e.doc,
            score: cosineSimilarity(queryVector, e.vector),
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, k).map((s) => s.doc);
    }

    get size() {
        return this.entries.length;
    }
}

function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

// ── Embeddings & LLM factories ─────────────────────────────────────────────────
export function getEmbeddings(provider: AIProvider, apiKey: string) {
    if (provider === "openai") {
        return new OpenAIEmbeddings({ openAIApiKey: apiKey, modelName: "text-embedding-3-small" });
    }
    return new GoogleGenerativeAIEmbeddings({
        apiKey,
        modelName: "text-embedding-004"
    });
}

export function getLLM(provider: AIProvider, apiKey: string) {
    if (provider === "openai") {
        return new ChatOpenAI({ openAIApiKey: apiKey, modelName: "gpt-4o-mini", temperature: 0 });
    }
    console.log(`[RAG] Initializing Google AI with model: gemini-2.5-flash`);
    return new ChatGoogleGenerativeAI({
        apiKey,
        model: "gemini-2.5-flash",
        temperature: 0,
    });
}

// ── Document ingestion ─────────────────────────────────────────────────────────
async function chunkText(text: string, filename: string): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 400,
        separators: ["\n\n", "\n", " ", ""],
    });
    return splitter.createDocuments([text], [{ source: filename }]);
}

export async function ingestDocuments(
    text: string,
    filename: string,
    provider: AIProvider,
    apiKey: string
): Promise<{ store: SimpleVectorStore; chunkCount: number }> {
    const docs = await chunkText(text, filename);
    const embeddings = getEmbeddings(provider, apiKey);
    const vectors = await embeddings.embedDocuments(docs.map((d) => d.pageContent));

    const store = new SimpleVectorStore();
    store.addVectors(vectors, docs);

    return { store, chunkCount: docs.length };
}

export async function addDocumentsToStore(
    store: SimpleVectorStore,
    text: string,
    filename: string,
    provider: AIProvider,
    apiKey: string
): Promise<{ chunkCount: number }> {
    const docs = await chunkText(text, filename);
    const embeddings = getEmbeddings(provider, apiKey);
    const vectors = await embeddings.embedDocuments(docs.map((d) => d.pageContent));
    store.addVectors(vectors, docs);
    return { chunkCount: docs.length };
}

// ── RAG query with conversation memory ────────────────────────────────────────
export async function runRAGQuery(
    question: string,
    session: SessionData
): Promise<{ answer: string; sources: string[] }> {
    if (!session.vectorStore) throw new Error("No documents uploaded yet.");
    console.log(`[RAG] Running query: "${question}"`);

    // Embed the question
    const embeddings = getEmbeddings(session.provider, session.apiKey);
    const [queryVector] = await embeddings.embedDocuments([question]);

    // Retrieve top-k relevant chunks
    const docs = session.vectorStore.similaritySearch(queryVector, 6);
    const context = docs.map((d) => d.pageContent).join("\n\n---\n\n");

    // Build message context with instructions
    const promptInstructions = `You are a helpful AI assistant. Answer questions based on the document context below.
If the answer is not in the context, say you don't know. Be concise and factual.

DOCUMENT CONTEXT:
${context}

---
Based on the above context, please answer the following question.`;

    const messages: BaseMessage[] = [];

    // Include last 6 turns
    for (const msg of session.history.slice(-6)) {
        messages.push(
            msg.role === "human" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        );
    }

    // Prepend instructions to the current question for better context awareness
    const fullQuestion = `${promptInstructions}\n\nQUESTION: ${question}`;
    messages.push(new HumanMessage(fullQuestion));

    const llm = getLLM(session.provider, session.apiKey);
    console.log(`[RAG] Invoking LLM...`);
    const response = await llm.invoke(messages);
    console.log(`[RAG] LLM response received.`);

    const answer =
        typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content);

    const sources = [...new Set(docs.map((d) => d.metadata?.source as string).filter(Boolean))];
    console.log(`[RAG] Query complete. Sources: ${sources.join(", ")}`);

    return { answer, sources };
}
