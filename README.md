# Athena AI — HR Interview Coach (RAG Bot)

A simple RAG (Retrieval-Augmented Generation) chatbot built to help you practice and prepare for HR interviews. Ask a question, and Athena finds the most relevant advice from your knowledge base and generates a clear, practical answer.

## How It Works

1. Your training data (`DATA.md`) is split into chunks, embedded, and stored as vectors in **AstraDB**.
2. When you ask a question, the app embeds your question and finds the most similar chunks via vector search.
3. Those chunks are injected as context into a **Gemini** prompt, which generates the final answer.

## Tech Stack

- **Next.js** — App framework (frontend + API route)
- **Google Gemini** — Embeddings (`gemini-embedding-001`) + LLM (`gemini-2.0-flash`)
- **DataStax AstraDB** — Vector database for storing and querying embeddings
- **LangChain** — Markdown text splitter for chunking the data

## Setup

### 1. Environment Variables

Create a `.env` file in the project root with the following:

```env
GEMINI_API_KEY=your_gemini_api_key
ASTRA_DB_API_ENDPOINT=your_astra_db_api_endpoint
ASTRA_DB_APPLICATION_TOKEN=your_astra_db_application_token
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=athena_ai
```

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `ASTRA_DB_API_ENDPOINT` | AstraDB dashboard → your database → Connect → API Endpoint |
| `ASTRA_DB_APPLICATION_TOKEN` | AstraDB dashboard → your database → Connect → Generate Token |
| `ASTRA_DB_NAMESPACE` | The keyspace name (default is `default_keyspace`) |
| `ASTRA_DB_COLLECTION` | Name for your vector collection (e.g. `athena_ai`) |

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Add Your Training Data

Edit the `DATA.md` file in the project root. This is the knowledge base Athena uses to answer questions. Structure it using markdown headings and bullet points — the splitter uses headings to create meaningful chunks.

**Sample structure:**

```markdown
# Topic Title

Brief overview or context about this topic.

## Subtopic

- Key point one
- Key point two
  - Supporting detail
  - Example or tip

## Another Subtopic

- Advice or strategy
- Sample answer:
  "Your sample answer goes here. Keep it conversational and practical."

# Another Topic Title

## Question Category

- Question one?
  - How to approach it
  - What to avoid
  - Sample answer or framework to use (e.g. STAR method)

- Question two?
  - Tips for answering
```

> **Tip:** Use clear `#` headings for major topics and `##` for subtopics. The text splitter chunks by these boundaries, so well-structured headings = better retrieval = better answers.

### 4. Seed the Vector Database

Once your `DATA.md` is ready, run the seed script to embed and store the data:

```bash
pnpm seed
```

This reads `DATA.md`, splits it into chunks, generates embeddings via Gemini, and inserts them into AstraDB.

> **Note:** Run this again whenever you update `DATA.md`.

### 5. Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start asking questions.
