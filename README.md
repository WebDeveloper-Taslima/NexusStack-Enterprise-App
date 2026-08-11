# NexusStack — Full-Stack JavaScript & Claude AI Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4.21-blue.svg)](https://expressjs.com)
[![Claude AI SDK](https://img.shields.io/badge/Anthropic_Claude_SDK-v0.27-purple.svg)](https://docs.anthropic.com)
[![Vite](https://img.shields.io/badge/Vite-v6.0-646CFF.svg)](https://vitejs.dev)
[![Database](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL-orange.svg)](https://sqlite.org)

NexusStack is a production-ready, full-stack JavaScript web application featuring a modern **Node.js Express backend**, a high-performance **Vite front-end**, full **CRUD user data management**, file upload workflows, and token-by-token **Claude 3.5 Sonnet SDK streaming** via Server-Sent Events (SSE).

---

## 🌟 Key Features & Architecture

```
      +-------------------------------------------------------------+
      |                Vite Responsive Front-End                    |
      |   - AI Chat & Prompt Studio (Real-time SSE Streaming)       |
      |   - User Data Upload & CRUD Management Hub                  |
      |   - Interactive Database Explorer & SQL vs NoSQL Guide      |
      +------------------------------+------------------------------+
                                     |  HTTP / REST & SSE Stream
                                     v
      +-------------------------------------------------------------+
      |               Node.js Express Back-End                      |
      |   - Express App & RESTful Routes (/api/items, /api/ai)      |
      |   - Claude AI SDK Handler (Anthropic API Streaming)         |
      |   - File/Data Upload Processing Engine                      |
      |   - Local SQLite / Cloud PostgreSQL Database Controller     |
      +------------------------------+------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
    +----------------------+                   +-----------------------+
    | Local SQLite Database|                   |  Anthropic Claude API |
    |  (Zero setup dev)    |                   |   (Streaming SDK)     |
    +----------------------+                   +-----------------------+
```

1. **Responsive & Rich UI/UX**:
   - Modern dark theme (Obsidian & glowing gradient accents) with glassmorphism cards, micro-animations, Inter/Plus Jakarta Sans typography, and tabbed navigation.
   - 100% mobile-responsive layout across all device viewports.

2. **Claude AI SDK & SSE Streaming Integration**:
   - Integrated with `@anthropic-ai/sdk` (`claude-3-5-sonnet-20241022` & `claude-3-haiku-20240307`).
   - Server-Sent Events (SSE) `/api/ai/stream` endpoint for live streaming token delivery directly to the front-end.
   - Intelligent local mock streaming generator when `ANTHROPIC_API_KEY` is not provided, allowing instant keyless local dev.

3. **Data Upload & Full CRUD Workflow**:
   - Complete Create, Read, Update, and Delete operations for user-generated documents/records.
   - Drag-and-drop file upload workflow supporting JSON arrays, CSV spreadsheets, and plain text files.
   - Live search input, category filtering, and record management modals.

4. **Database Explorer & Selection Guide**:
   - Database metrics dashboard, live table inspector, and raw schema viewer.
   - Interactive SQL vs NoSQL decision guide with scenario selector and recommendation matrix.

---

## 🚀 Quick Start (Single Command Dev Mode)

### 1. Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

### 2. Environment Setup
Copy the template `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
PORT=3001
NODE_ENV=development

# Anthropic API Key (Optional for local testing; keyless fallback available)
ANTHROPIC_API_KEY=your_claude_api_key_here

DATABASE_FILE=./server/data/app.db
```

### 3. Install Dependencies & Run Dev Mode
Run the following single command to launch both the Express backend server and the Vite dev server concurrently:

```bash
# Install dependencies
npm install

# Run single-command dev mode
npm run dev
```

The application will start at:
- **Front-End UI**: [http://localhost:3000](http://localhost:3000)
- **Back-End Express API**: [http://localhost:3001](http://localhost:3001)

---

## 📚 API Endpoints Documentation

### Claude AI Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/ai/prompts` | Retrieves featured prompt engineering templates |
| `POST` | `/api/ai/stream` | Initiates SSE stream for Claude AI completions (`prompt`, `systemPrompt`, `model`, `temperature`) |

### Document CRUD & Data Upload Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/items` | List records with optional `q` search and `category` filter |
| `GET` | `/api/items/:id` | Get single record by ID |
| `POST` | `/api/items` | Create new document record |
| `PUT` | `/api/items/:id` | Update document record by ID |
| `DELETE` | `/api/items/:id` | Delete record by ID |
| `POST` | `/api/items/upload` | Multipart file upload workflow (.json, .csv, .txt) |
| `GET` | `/api/db/stats` | System database health, engine type, and record metrics |

---

## 💡 Database Guidance: SQL vs. NoSQL

| Dimension | Relational SQL (SQLite / PostgreSQL) | NoSQL (MongoDB / Document) |
| :--- | :--- | :--- |
| **Recommendation** | **Recommended for NexusStack** | Alternative for dynamic schemas |
| **Data Integrity** | Strict schema & Foreign Key ACID safety | Schema-less, eventual consistency |
| **AI Workflows** | Seamless `pgvector` vector embeddings support | MongoDB Atlas Vector Search |
| **Local Dev** | Zero-config file (`app.db`) | Requires local server or cloud cluster |

---

## ☁️ Cloud Deployment Guide

### Option 1: Render (Full-Stack Unified Web Service)
1. Push repository to GitHub.
2. Create a new **Web Service** on Render.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm run start`
5. Add environment variable `ANTHROPIC_API_KEY`.

### Option 2: Vercel (Front-End) + Supabase (PostgreSQL)
1. Provision a free PostgreSQL database on [Supabase](https://supabase.com).
2. Deploy `client/` build to Vercel.
3. Deploy `server/` as Node.js Serverless functions or Railway web service.

---

## 📄 License
MIT License — Free to use and modify for commercial and personal projects.
