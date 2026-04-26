//this file is not needed in the project
//it just a place to test drive some scripts

import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: "Explain how AI works",
  });
  console.log(response.text);
}

main();
