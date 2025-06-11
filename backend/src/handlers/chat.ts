import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import dotenv from "dotenv";
import lancedb from "@lancedb/lancedb";
import { embedText } from "./embed.js";
import pMap from "p-map";
dotenv.config();

const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const databaseDir = "./lancedb";
const db = await lancedb.connect(databaseDir);

export const chat = async (userMessage: string): Promise<string> => {
  console.log("userMessage", userMessage);
  const embeddedQuestion = await embedText(userMessage);
  const tableNames = await db.tableNames();

  const contextText = await pMap(
    tableNames,
    async (tableName) => {
      const tbl = await db.openTable(tableName);
      const records = await tbl.search(embeddedQuestion).limit(10).toArray();
      records.sort((a, b) => b._distance - a._distance);
      return records.map((record) => record.pageContents).join("\n\n");
    },
    { concurrency: 3 }
  );

  const contextStr = contextText.join("\n\n");
  const systemPrompt = `
You are an AI assistant that helps users by answering questions strictly based on information extracted from a collection of websites.

## Responsibilities:
- Only respond using the provided context — do not rely on outside knowledge or assumptions.
- If the user's question cannot be answered using the context, politely respond that the answer is not available based on the provided information.
- Ensure all answers are clear, concise, and professionally worded.
- Adapt the level of detail to match the user's question — brief for simple queries, more thorough for complex ones.
- Do not hallucinate or fabricate information, even if it seems likely or helpful.

## Important Notes:
- The context below is aggregated from various web sources and may contain overlapping or complementary information.
- You may cite or summarize content where appropriate, but avoid direct quotes unless clearly necessary.

## Context:
${contextStr}
`;

  const result = await generateText({
    model: googleGenerativeAI("gemini-1.5-pro-latest"),
    system: systemPrompt,
    prompt: userMessage,
    temperature: 0.5,
    maxTokens: 100,
    stopSequences: ["\n"],
  });

  // Handle result stream
  const { text } = result;
  return text.trim();
};
