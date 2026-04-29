import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";

const {
  GEMINI_API_KEY,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
} = process.env;

if (
  !GEMINI_API_KEY ||
  !ASTRA_DB_API_ENDPOINT ||
  !ASTRA_DB_APPLICATION_TOKEN ||
  !ASTRA_DB_NAMESPACE ||
  !ASTRA_DB_COLLECTION
) {
  throw new Error("env not set");
}

// // gemini-3.1-flash-lite
const ai = new GoogleGenAI({});

const client = new DataAPIClient();
const db = client.db(ASTRA_DB_API_ENDPOINT, {
  keyspace: ASTRA_DB_NAMESPACE,
  token: ASTRA_DB_APPLICATION_TOKEN,
});
const collection = db.collection(String(ASTRA_DB_COLLECTION));

// ─── RAG Pipeline ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as {
      messages: { role: string; content: string }[];
    };

    // The latest user message is the query we embed
    const latestMessage = messages[messages.length - 1]?.content ?? "";

    // 1. Generate embedding for the user's question
    const embeddingResponse = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: latestMessage,
    });

    const queryVector = embeddingResponse.embeddings?.[0]?.values;
    if (!queryVector) {
      return NextResponse.json(
        { content: "Failed to process your question. Please try again." },
        { status: 500 },
      );
    }

    // 2. Vector search — find the most relevant chunks
    const cursor = collection.find(
      {},
      {
        sort: { $vector: queryVector },
        limit: 10,
        includeSimilarity: true,
        projection: { text: 1 },
      },
    );

    const documents = await cursor.toArray();
    const context = documents.map((doc) => doc.text).join("\n\n---\n\n");

    // 3. Build the augmented prompt
    const systemPrompt = `You are "Athena", an expert HR interview coach.
Your job is to help users prepare for HR interviews by giving clear, practical, and confident answers.

RULES:
- Use ONLY the context provided below to answer the question. If the context doesn't cover the topic, say so honestly and offer general best-practice advice.
- Keep answers concise but thorough — aim for 2-4 paragraphs max.
- Use a warm, encouraging, and professional tone.
- When relevant, suggest frameworks like STAR (Situation, Task, Action, Result) or CAR (Challenge, Action, Result).
- Format key points clearly. You may use bullet points sparingly.
- Do NOT make up facts or company-specific details.
- Always use simple words to explain things. Assume the user is not a native english speaker or someone who might not understand complex terms.

IMPORTANT CONSTRAINTS:
- Stick to the context from the knowledge base given below as much as possible
- If the knowledge base doesn't have that data. Respond that you are not sure and suggest the best way from within the knowlege base data. 
- The knowledge base is structured in a question and answer format mostly. Use the ansewrs given to in the knowldge base as the first suggestion on how to answer and craft a sample answer if needed.
- Using simple english,  without jargon, and natural language that doesn't seem fake is very important.

CONTEXT FROM KNOWLEDGE BASE:
${context}`;

    // Build the conversation for Gemini (map history)
    const geminiContents = messages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.content }],
    }));

    // 4. Generate the answer
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: geminiContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const answer =
      response.text ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ content: answer });
  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { content: "I couldn't generate a response. Please try again." },
      { status: 500 },
    );
  }
}
