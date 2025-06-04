import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import dotenv from "dotenv";
import lancedb from "@lancedb/lancedb";
import { embedText } from "./embed.js";

dotenv.config();

const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

// const groq = createGroq({
//   apiKey: process.env.GROQ_API_KEY,
// });

const databaseDir = "./lancedb";
const db = await lancedb.connect(databaseDir);

export const chat = async (
  userMessage: string,
  url: string
): Promise<string> => {
  console.log("userMessage", userMessage);
  console.log("url", url);
  const embeddedQuestion = await embedText(userMessage);
  const tableNames = await db.tableNames();
  const requiredTableNames = url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  const tableNamesWithUrl = tableNames.filter((name) => name.includes(requiredTableNames));
  console.log("tableNamesWithUrl", tableNamesWithUrl);
  const contextText = await Promise.all(
    tableNamesWithUrl.map(async (tableName) => {
      const tbl = await db.openTable(tableName);
      const records = await tbl.search(embeddedQuestion).limit(10).toArray();
      return records.map((record) => record.pageContents).join("\n\n");
    })
  );

  const contextStr = contextText.join("\n\n");
  // console.log("contextStr", contextStr);
  const systemPrompt =  `
      You are an AI assistant helping users understand and navigate content from multiple websites.

      Your responsibilities:
      - Only answer based on the website content provided in the context.
      - Politely decline questions unrelated to the content.
      - Be clear, helpful, and professional.
      - Tailor your response length appropriately to the user's question — concise when possible, detailed when needed.

      Each piece of context below is extracted from different websites and may be relevant to the user's question.

      Context:
      ${contextStr}
            `

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
