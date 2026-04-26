//this file is not needed in the project
//it just a place to test drive some scripts

import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({});

async function main() {
  const ai = new GoogleGenAI({});

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: [
      "What is the meaning of life?",
      "What is creation?",
      "How to make noodles?",
    ],
  });

  console.log(response);
}

main();
