
---

# 🕷️ AI-Powered Web Crawler & Q\&A System
A full-stack application that crawls websites, stores extracted content in a vector database (**LanceDB**), and allows users to ask questions with context-aware, AI-generated answers.

---

## 📌 Overview

This project is a combination of **web scraping**, **vector search**, and **AI-driven Q\&A**, built using modern web technologies.

> **Goal:** Allow users to crawl any public website, extract meaningful content, store it semantically, and interact with that content via natural language queries.

---

## 🧱 Architecture

**Frontend**:
Built with **React + Vite**, the UI lets users input a URL for crawling and ask questions.

**Backend**:
Runs on **Fastify**, handles crawling via **PlaywrightCrawler**, processes content with **embedding models**, stores data in **LanceDB**, and returns intelligent answers using a vector search + LLM combo.

```
             +---------------+
             |    Frontend  |
             |  React + Vite  |
             +---------------+
                       |
                       |
                       v
             +---------------+
             |  Fastify API  |
             |  /crawl /chat  |
             +---------------+
                       |
                       |
                       v
             +---------------+
             | PlaywrightCrawler|
             |  Extract Text Data|
             +---------------+
                       |
                       |
                       v
             +---------------+
             |  Embedding Model  |
             | (e.g. OpenAI / Groq)|
             +---------------+
                       |
                       |
                       v
             +---------------+
             |     LanceDB (VDB)  |
             +---------------+

---

## ✨ Features

✅ Crawl any public website using headless browser
✅ Extract meaningful page content (skips scripts, styles, boilerplate)
✅ Embed data into vectors using state-of-the-art LLMs
✅ Store and query with **LanceDB**
✅ Ask natural language questions and get contextually relevant answers
✅ Built on a **scalable**, **modular**, and **modern** full-stack setup

---

## 🛠️ Tech Stack

| Layer        | Tech                         |
| ------------ | ---------------------------- |
| Frontend     | React, Vite, TypeScript      |
| Backend      | Fastify, Node.js, TypeScript |
| Crawler      | Crawlee (PlaywrightCrawler)  |
| Vector Store | LanceDB                      |
| Embedding    | OpenAI / Groq                |

---

## 📂 Folder Structure

```
my-crawlee/
├── backend/
│   ├── index.ts            # Fastify server setup
│   ├── crawler.ts          # Website crawling logic
│   ├── embed.ts            # Embedding + AI integration
│   ├── lancedb.ts          # LanceDB operations
│   └── routes/             # API route handlers
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── components/     # UI components
│   │   ├── api.ts          # API integration
│   └── vite.config.ts      # Vite setup
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/vomeshatukuri/poc_crawlee.git
cd my-crawlee
```

### 2. Install Dependencies

**Backend**

```bash
cd backend
npm install
```

**Frontend**

```bash
cd ../frontend
npm install
```

### 3. Environment Setup

In `backend/`, create a `.env` file:

```env
GROQ_API_KEY = your_groq_or_openai_key
```

### 4. Start Development Servers

**Start Backend**

```bash
cd backend
npm start
```

**Start Frontend**

```bash
cd ../frontend
npm run dev
```

---

## 💡 Usage Guide

1. Enter a URL in the frontend.
2. Backend crawls and processes the content.
3. Content is stored as vector embeddings in LanceDB.
4. Ask a question based on the crawled site.
5. AI generates a context-aware answer using vector similarity search.

---

## 🧠 Example Use Cases

* 🔍 Competitor website analysis
* 📚 Knowledge base ingestion & querying
* 📰 News site summarization and Q\&A
* 🛠️ Internal tool for crawling documentation sites

---

## 🚧 Future Enhancements

* 🛡️ User authentication and usage limits
* 🌍 Crawl multi-page or entire domains
* 🧩 Add summarization and topic tagging
* 📊 Visualize crawl data insights
* ⚙️ Docker + CI/CD support
