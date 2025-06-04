import Fastify from "fastify";
import cors from "@fastify/cors";
import { chat } from "./handlers/chat.js";
import * as lancedb from "@lancedb/lancedb";
import dotenv from "dotenv";
import { crawl } from "./handlers/crawlee.js";
dotenv.config();

const fastify = Fastify();
const port = 5570;

// Root route
fastify.get("/", async (request, reply) => {
  console.log(request.body);
  reply.send({ message: "Hello, Worl" });
});

// Crawling route
fastify.post("/crawl", async (request, reply) => {
  const { url } = request.body as { url: string };
  console.log("Received URL:", url);
  const folder = url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  const Tablename = folder;
  const res = await crawl(url, Tablename);
  reply.send({ message: res.message });
});

// Chat route
fastify.post("/chat", async (request, reply) => {
  const { message, url } = request.body as { message: string; url: string };
  console.log(">>>>>>>>>", message, url);

  try {
    const res = await chat(message, url);
    console.log(">>>>", res);
    reply.send({ text: res });
  } catch (err) {
    console.error("Chat error:", err);
    reply.status(500).send({ error: "Internal Server Error" });
  }
});

// CORS
fastify.register(cors, {
  origin: "http://localhost:5173",
});

// Start server
fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
