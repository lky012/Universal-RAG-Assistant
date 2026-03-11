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

    /**
     * Returns top-k docs by cosine similarity, with near-duplicate filtering.
     * Two chunks are considered near-duplicates when their score is > 0.97
     * (i.e. they share >97% of their content — typical of excessive overlap).
     */
    similaritySearch(queryVector: number[], k: number): Document[] {
        if (this.entries.length === 0) return [];

        const scored = this.entries.map((e) => ({
            doc: e.doc,
            score: cosineSimilarity(queryVector, e.vector),
        }));
        scored.sort((a, b) => b.score - a.score);

        // Deduplicate near-identical chunks (artefact of chunk overlap)
        const results: typeof scored = [];
        for (const candidate of scored) {
            if (results.length >= k) break;
            const isDuplicate = results.some(
                (r) => cosineSimilarity(r.doc.pageContent, candidate.doc.pageContent) > 0.97 ||
                    r.doc.pageContent.trim() === candidate.doc.pageContent.trim()
            );
            if (!isDuplicate) results.push(candidate);
        }

        return results.map((s) => s.doc);
    }

    get size() {
        return this.entries.length;
    }
}

function cosineSimilarity(a: number[] | string, b: number[] | string): number {
    // Overload: when called with strings, compute character-level Jaccard as a
    // cheap near-duplicate proxy (avoids a second embedding call).
    if (typeof a === "string" && typeof b === "string") {
        const setA = new Set(a.split(/\s+/));
        const setB = new Set(b.split(/\s+/));
        const intersection = [...setA].filter((w) => setB.has(w)).length;
        return intersection / (setA.size + setB.size - intersection);
    }

    // Normal numeric cosine similarity
    const va = a as number[];
    const vb = b as number[];
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < va.length; i++) {
        dot += va[i] * vb[i];
        normA += va[i] * va[i];
        normB += vb[i] * vb[i];
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
        modelName: "text-embedding-004",
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

// ── Chunking ───────────────────────────────────────────────────────────────────
/**
 * Chunk strategy optimized for legal/financial PDFs:
 *
 *  chunkSize: 800 chars ≈ ~200 tokens — fits a full clause or paragraph.
 *
 *  chunkOverlap: 200 chars ≈ ~50 tokens (25% overlap).
 *    Legal text is heavily referential ("as defined in Section 3.2",
 *    "notwithstanding the foregoing"). A 10% overlap (80 chars) severs
 *    referents from their definitions at chunk boundaries; 25% overlap
 *    preserves cross-clause continuity.
 *
 *  separators (ordered semantic → syntactic):
 *    1. "\n\n"  — paragraph breaks
 *    2. "\n"    — single line breaks (lists, headings)
 *    3. ".\n"   — sentence end + newline (common PDF extraction artefact)
 *    4. ". "    — standard sentence ends
 *    5. ", "    — clause breaks
 *    6. " "     — word boundary (last resort)
 *    7. ""      — character split (never reached in practice)
 */
async function chunkText(text: string, filename: string): Promise<Document[]> {
    // Normalise whitespace produced by PDF text extraction:
    // collapse runs of 3+ blank lines into a single paragraph break.
    const normalised = text.replace(/\n{3,}/g, "\n\n").trim();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 200,                               // ↑ 80→200 for legal cross-references
        separators: ["\n\n", "\n", ".\n", ". ", ", ", " ", ""], // added ".\n" for PDF artefacts
    });

    const docs = await splitter.createDocuments([normalised], [{ source: filename }]);

    // Filter out noise: chunks that are too short to carry meaningful content
    // (e.g. page numbers, isolated headers "<3 words>")
    return docs.filter((d) => d.pageContent.trim().split(/\s+/).length >= 8);
}

// ── Document ingestion ─────────────────────────────────────────────────────────
export async function ingestDocuments(
    text: string,
    filename: string,
    provider: AIProvider,
    apiKey: string
): Promise<{ store: SimpleVectorStore; chunkCount: number }> {
    const docs = await chunkText(text, filename);
    const embeddings = getEmbeddings(provider, apiKey);

    // Batch embed in groups of 100 to avoid request-size limits
    const vectors = await batchEmbedDocuments(embeddings, docs);

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
    const vectors = await batchEmbedDocuments(embeddings, docs);
    store.addVectors(vectors, docs);
    return { chunkCount: docs.length };
}

/**
 * Embeds documents in batches of 100 to avoid hitting API payload limits.
 */
async function batchEmbedDocuments(
    embeddings: ReturnType<typeof getEmbeddings>,
    docs: Document[],
    batchSize = 100
): Promise<number[][]> {
    const vectors: number[][] = [];
    for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize).map((d) => d.pageContent);
        const batchVectors = await embeddings.embedDocuments(batch);
        vectors.push(...batchVectors);
    }
    return vectors;
}

// ── Adaptive top-k ─────────────────────────────────────────────────────────────
/**
 * Choose how many chunks to retrieve based on store density.
 *
 * Heuristic:
 *   - Tiny documents  (<  30 chunks): k = 3  — whole doc is already small
 *   - Medium documents(< 150 chunks): k = 4  — typical report / article
 *   - Large documents (≥ 150 chunks): k = 5  — dense PDF; more context needed
 *
 * This avoids injecting 6 × 800-char chunks (~1,200 tokens) for a 5-page doc
 * where 3 chunks (~450 tokens) suffice.
 */
function adaptiveK(storeSize: number): number {
    if (storeSize < 30) return 3;
    if (storeSize < 150) return 4;
    return 6;  // ↑ 5→6: dense contracts need wider recall across multi-section clauses
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

    // Adaptive retrieval: fewer chunks for small stores → fewer wasted tokens
    const k = adaptiveK(session.vectorStore.size);
    const docs = session.vectorStore.similaritySearch(queryVector, k);

    // Format context blocks with a lightweight separator
    const context = docs
        .map((d, i) => `[${i + 1}] ${d.pageContent.trim()}`)
        .join("\n\n");

    // ── System prompt (sent once, not repeated in every human turn) ──────────
    // Keeping the system message minimal and stable enables prefix caching on
    // providers that support it (OpenAI Prompt Caching, Gemini context caching).
    const systemMessage = new SystemMessage(
        "You are a helpful document assistant. " +
        "Answer questions strictly based on the provided document context. " +
        "If the answer is not present in the context, say you don't know. " +
        "Be concise and factual."
    );

    // ── Conversation history (last 4 turns = 8 messages max) ─────────────────
    // Reduced from 6 turns to 4. Most follow-up questions only need 2–3 turns
    // of prior context; keeping fewer turns saves ~400–600 tokens per query.
    const historyMessages: BaseMessage[] = session.history
        .slice(-4)
        .map((msg: ChatMessage) =>
            msg.role === "human" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        );

    // ── Current turn: context injected only in this message ──────────────────
    const contextualQuestion =
        `Document context:\n${context}\n\n---\nQuestion: ${question}`;

    const messages: BaseMessage[] = [
        systemMessage,
        ...historyMessages,
        new HumanMessage(contextualQuestion),
    ];

    const llm = getLLM(session.provider, session.apiKey);
    console.log(`[RAG] Invoking LLM with k=${k} chunks, ${historyMessages.length} history messages...`);
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
