import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenAI } from "@google/genai";
import { MarkdownTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import path from "path";
import "dotenv/config";

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

const dataSource = [path.join(process.cwd(), "DATA.md")];

const client = new DataAPIClient();
const ai = new GoogleGenAI({});

//DB set up
const db = client.db(ASTRA_DB_API_ENDPOINT, {
  keyspace: ASTRA_DB_NAMESPACE,
  token: ASTRA_DB_APPLICATION_TOKEN,
});

async function createCollection() {
  const res = await db.createCollection(String(ASTRA_DB_COLLECTION), {
    vector: {
      dimension: 3072,
      metric: "dot_product",
    },
  });

  console.log(res);
}

//data transformation
const splitter = new MarkdownTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

//text cleanup regex
function cleanMarkdownText(text: string): string {
  return (
    text
      // Remove Notion's specific HTML tags
      .replace(/<aside>/g, "")
      .replace(/<\/aside>/g, "")
      // Remove common emojis Notion uses for callouts
      .replace(/💡/g, "")
      // Remove bold and italic markdown syntax to densify the text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      // Collapse multiple empty lines into a single empty line
      .replace(/\n{3,}/g, "\n\n")
      // Trim leading and trailing whitespace
      .trim()
  );
}

//adding embeddings
async function loadSampleData() {
  const collection = db.collection(String(ASTRA_DB_COLLECTION));

  for await (const filePath of dataSource) {
    console.log(`Processing file: ${filePath}`);

    // Read the local file
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const cleanedContent = cleanMarkdownText(rawContent);
    const chunks = await splitter.splitText(cleanedContent);

    const vectors: any[] = [];
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let i = 0; i < chunks.length; i += 20) {
      const chunkBatch = chunks.slice(i, i + 20);
      try {
        const response = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: chunkBatch,
        });

        if (!response.embeddings) {
          throw new Error("Failed to generate embeddings");
        }

        const batchVectors = response.embeddings.map((v, j) => ({
          $vector: v.values,
          text: chunkBatch[j],
        }));
        vectors.push(...batchVectors);
      } catch (err: any) {
        if (err.status === 429) {
          console.warn("Rate limited (429), waiting 10 seconds and retrying...");
          await delay(10000);
          i -= 20; // retry the same batch
          continue;
        }
        throw err;
      }

      if (i + 20 < chunks.length) {
        await delay(3000); // 3 second delay between batches
      }
    }

    const dbResponse = await collection.insertMany(vectors);
    console.log("DB Response: ", dbResponse);
  }
}

createCollection().then(() => loadSampleData());
