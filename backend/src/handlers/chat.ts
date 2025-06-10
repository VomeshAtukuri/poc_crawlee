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
You are an AI assistant tasked with helping users understand and navigate content extracted from multiple websites.

Your responsibilities:
- Respond **only** based on the provided website content.
- Politely decline questions that fall **outside** the given context.
- Keep responses clear, accurate, and professional.
- Adjust response length to match the user's query — brief when appropriate, detailed when necessary.

Note: The following context is compiled from different websites and may all be relevant to the user's question.

Context:
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
