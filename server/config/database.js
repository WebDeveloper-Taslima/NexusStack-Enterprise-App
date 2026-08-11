import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const JSON_DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const initialSeed = {
  items: [
    {
      id: 'doc-101',
      title: 'Claude 3.5 Sonnet Prompting Architecture',
      category: 'AI Architecture',
      content: 'Best practices for structuring system prompts, XML tags, multi-shot examples, and JSON output formatting with Claude 3.5 Sonnet.',
      tags: ['claude-ai', 'prompt-engineering', 'llm'],
      status: 'active',
      author: 'Senior JS Engineer',
      file_name: 'prompt_architecture_v1.md',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'doc-102',
      title: 'PostgreSQL vs MongoDB Scalability Matrix',
      category: 'Database Design',
      content: 'Comparative study evaluating ACID compliance, horizontally partitioned sharding, pgvector query latency, and document nesting limits.',
      tags: ['postgresql', 'mongodb', 'database', 'sql-vs-nosql'],
      status: 'active',
      author: 'Database Architect',
      file_name: 'db_scalability_matrix.json',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'doc-103',
      title: 'Node.js Express SSE Streaming Benchmark',
      category: 'Backend Development',
      content: 'Throughput measurement of Express Server-Sent Events (SSE) versus WebSocket for real-time LLM token streaming under 10k concurrent connections.',
      tags: ['nodejs', 'express', 'sse', 'streaming', 'performance'],
      status: 'review',
      author: 'Full-Stack Dev',
      file_name: 'sse_benchmark_report.csv',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  ai_logs: [
    {
      id: 'log-1',
      prompt_summary: 'Generate SQL query for user activity aggregation',
      model: 'claude-3-5-sonnet-20241022',
      tokens: 420,
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'log-2',
      prompt_summary: 'Refactor Express routing middleware to ES Modules',
      model: 'claude-3-5-sonnet-20241022',
      tokens: 310,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]
};

let dbInstance = null;
let useBetterSqlite = false;

// Attempt to load better-sqlite3 with fallback to resilient JSON file store
try {
  const BetterSqlite3 = (await import('better-sqlite3')).default;
  const dbPath = path.join(DATA_DIR, 'app.sqlite');
  const sqlite = new BetterSqlite3(dbPath);

  // Initialize SQLite tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      status TEXT DEFAULT 'active',
      author TEXT,
      file_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_logs (
      id TEXT PRIMARY KEY,
      prompt_summary TEXT NOT NULL,
      model TEXT NOT NULL,
      tokens INTEGER NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Check if items table is empty; if so, populate initial seed
  const count = sqlite.prepare('SELECT COUNT(*) as cnt FROM items').get();
  if (count.cnt === 0) {
    const insertStmt = sqlite.prepare(`
      INSERT INTO items (id, title, category, content, tags, status, author, file_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of initialSeed.items) {
      insertStmt.run(
        item.id,
        item.title,
        item.category,
        item.content,
        JSON.stringify(item.tags),
        item.status,
        item.author,
        item.file_name,
        item.created_at,
        item.updated_at
      );
    }
  }

  dbInstance = sqlite;
  useBetterSqlite = true;
  console.log('✅ Connected to SQLite database at:', dbPath);
} catch (err) {
  console.log('ℹ️ SQLite native driver notice:', err.message);
  console.log('🔄 Utilizing resilient JSON-backed data store layer for local execution.');

  if (!fs.existsSync(JSON_DB_FILE)) {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(initialSeed, null, 2), 'utf8');
  }
}

// JSON Database Helper functions
function readJsonDb() {
  try {
    const data = fs.readFileSync(JSON_DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return initialSeed;
  }
}

function writeJsonDb(data) {
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Exported Database Service Abstraction Layer
export const Database = {
  isNativeSqlite() {
    return useBetterSqlite;
  },

  getAllItems(searchQuery = '', categoryFilter = '') {
    if (useBetterSqlite) {
      let query = 'SELECT * FROM items WHERE 1=1';
      const params = [];

      if (searchQuery) {
        query += ' AND (title LIKE ? OR content LIKE ? OR author LIKE ?)';
        const term = `%${searchQuery}%`;
        params.push(term, term, term);
      }

      if (categoryFilter) {
        query += ' AND category = ?';
        params.push(categoryFilter);
      }

      query += ' ORDER BY created_at DESC';
      const rows = dbInstance.prepare(query).all(...params);

      return rows.map(r => ({
        ...r,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : r.tags
      }));
    } else {
      const db = readJsonDb();
      let items = db.items || [];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q) ||
          (i.author && i.author.toLowerCase().includes(q))
        );
      }

      if (categoryFilter) {
        items = items.filter(i => i.category === categoryFilter);
      }

      return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  getItemById(id) {
    if (useBetterSqlite) {
      const row = dbInstance.prepare('SELECT * FROM items WHERE id = ?').get(id);
      if (!row) return null;
      return {
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : row.tags
      };
    } else {
      const db = readJsonDb();
      return db.items.find(i => i.id === id) || null;
    }
  },

  createItem(itemData) {
    const newItem = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: itemData.title || 'Untitled Document',
      category: itemData.category || 'General',
      content: itemData.content || '',
      tags: Array.isArray(itemData.tags) ? itemData.tags : (itemData.tags ? itemData.tags.split(',').map(t => t.trim()) : []),
      status: itemData.status || 'active',
      author: itemData.author || 'Anonymous',
      file_name: itemData.file_name || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (useBetterSqlite) {
      const stmt = dbInstance.prepare(`
        INSERT INTO items (id, title, category, content, tags, status, author, file_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        newItem.id,
        newItem.title,
        newItem.category,
        newItem.content,
        JSON.stringify(newItem.tags),
        newItem.status,
        newItem.author,
        newItem.file_name,
        newItem.created_at,
        newItem.updated_at
      );
    } else {
      const db = readJsonDb();
      db.items.unshift(newItem);
      writeJsonDb(db);
    }

    return newItem;
  },

  updateItem(id, itemData) {
    const existing = this.getItemById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      title: itemData.title !== undefined ? itemData.title : existing.title,
      category: itemData.category !== undefined ? itemData.category : existing.category,
      content: itemData.content !== undefined ? itemData.content : existing.content,
      tags: itemData.tags !== undefined ? (Array.isArray(itemData.tags) ? itemData.tags : itemData.tags.split(',').map(t => t.trim())) : existing.tags,
      status: itemData.status !== undefined ? itemData.status : existing.status,
      author: itemData.author !== undefined ? itemData.author : existing.author,
      updated_at: new Date().toISOString()
    };

    if (useBetterSqlite) {
      const stmt = dbInstance.prepare(`
        UPDATE items
        SET title = ?, category = ?, content = ?, tags = ?, status = ?, author = ?, updated_at = ?
        WHERE id = ?
      `);
      stmt.run(
        updated.title,
        updated.category,
        updated.content,
        JSON.stringify(updated.tags),
        updated.status,
        updated.author,
        updated.updated_at,
        id
      );
    } else {
      const db = readJsonDb();
      const idx = db.items.findIndex(i => i.id === id);
      if (idx !== -1) {
        db.items[idx] = updated;
        writeJsonDb(db);
      }
    }

    return updated;
  },

  deleteItem(id) {
    if (useBetterSqlite) {
      const stmt = dbInstance.prepare('DELETE FROM items WHERE id = ?');
      const res = stmt.run(id);
      return res.changes > 0;
    } else {
      const db = readJsonDb();
      const initialLength = db.items.length;
      db.items = db.items.filter(i => i.id !== id);
      writeJsonDb(db);
      return db.items.length < initialLength;
    }
  },

  bulkInsert(itemsArray) {
    const inserted = [];
    for (const item of itemsArray) {
      const newItem = this.createItem(item);
      inserted.push(newItem);
    }
    return inserted;
  },

  logAiInteraction(promptSummary, model, tokens) {
    const log = {
      id: `log-${Date.now()}`,
      prompt_summary: promptSummary.substring(0, 120),
      model,
      tokens,
      timestamp: new Date().toISOString()
    };

    if (useBetterSqlite) {
      const stmt = dbInstance.prepare(`
        INSERT INTO ai_logs (id, prompt_summary, model, tokens, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(log.id, log.prompt_summary, log.model, log.tokens, log.timestamp);
    } else {
      const db = readJsonDb();
      if (!db.ai_logs) db.ai_logs = [];
      db.ai_logs.unshift(log);
      writeJsonDb(db);
    }

    return log;
  },

  getDbStats() {
    let totalItems = 0;
    let categories = {};
    let totalAiLogs = 0;

    const items = this.getAllItems();
    totalItems = items.length;

    items.forEach(i => {
      categories[i.category] = (categories[i.category] || 0) + 1;
    });

    if (useBetterSqlite) {
      const logCount = dbInstance.prepare('SELECT COUNT(*) as cnt FROM ai_logs').get();
      totalAiLogs = logCount.cnt;
    } else {
      const db = readJsonDb();
      totalAiLogs = (db.ai_logs || []).length;
    }

    return {
      engine: useBetterSqlite ? 'SQLite 3 (better-sqlite3)' : 'JSON Document Engine',
      totalItems,
      categories,
      totalAiLogs,
      status: 'healthy'
    };
  }
};
