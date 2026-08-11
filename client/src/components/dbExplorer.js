import { ApiClient } from '../api/client.js';

export function renderDbExplorer(container, showToast) {
  container.innerHTML = `
    <div class="db-explorer-container">
      
      <!-- Top Metrics Dashboard Cards -->
      <div class="card-grid mb-4">
        
        <div class="glass-card metric-card">
          <div class="metric-icon bg-indigo">
            <i class="ri-database-line"></i>
          </div>
          <div class="metric-details">
            <span class="metric-label">Database Engine</span>
            <h3 id="stat-engine" class="metric-value">Loading...</h3>
            <span class="metric-sub text-emerald"><i class="ri-checkbox-circle-fill"></i> System Healthy</span>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-icon bg-violet">
            <i class="ri-file-list-3-line"></i>
          </div>
          <div class="metric-details">
            <span class="metric-label">User Document Records</span>
            <h3 id="stat-total-items" class="metric-value">0</h3>
            <span class="metric-sub">Active DB Items</span>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-icon bg-cyan">
            <i class="ri-folder-open-line"></i>
          </div>
          <div class="metric-details">
            <span class="metric-label">Data Categories</span>
            <h3 id="stat-categories-count" class="metric-value">0</h3>
            <span class="metric-sub">Active Taxonomies</span>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-icon bg-emerald">
            <i class="ri-history-line"></i>
          </div>
          <div class="metric-details">
            <span class="metric-label">Claude AI Audit Logs</span>
            <h3 id="stat-ai-logs" class="metric-value">0</h3>
            <span class="metric-sub">Prompt Calls Recorded</span>
          </div>
        </div>

      </div>

      <!-- SQL Schema & Table Live Inspector -->
      <div class="glass-card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="ri-terminal-box-line gradient-text"></i>
            Relational Database Schema & Inspector
          </h2>
          <button id="btn-refresh-stats" class="btn btn-secondary btn-sm">
            <i class="ri-refresh-line"></i> Refresh Stats
          </button>
        </div>

        <div class="schema-tabs mb-3">
          <button class="schema-tab active" data-table="items_table">
            <i class="ri-table-line"></i> Table: items (User Data)
          </button>
          <button class="schema-tab" data-table="ai_logs_table">
            <i class="ri-history-line"></i> Table: ai_logs (AI Interactions)
          </button>
        </div>

        <div id="schema-viewer" class="code-block mb-3">
          <span class="text-dim">-- Loading database schema definition...</span>
        </div>

        <div class="table-responsive">
          <table class="custom-table" id="db-inspect-table">
            <thead>
              <tr id="inspect-headers">
                <th>Column</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody id="inspect-rows">
              <tr><td colspan="3">Loading inspector data...</td></tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  `;

  // Additional CSS specific to DB Explorer
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .metric-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .metric-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      color: #fff;
    }
    .bg-indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .bg-violet { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
    .bg-cyan { background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); }
    .bg-emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

    .metric-details { display: flex; flex-direction: column; }
    .metric-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
    .metric-value { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; line-height: 1.2; }
    .metric-sub { font-size: 0.75rem; color: var(--text-dim); margin-top: 0.2rem; }
    .text-emerald { color: var(--accent-emerald); }

    .schema-tabs { display: flex; gap: 0.5rem; }
    .schema-tab {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .schema-tab.active {
      background: var(--accent-primary);
      color: #fff;
      border-color: var(--accent-primary);
    }
    .mb-3 { margin-bottom: 1rem; }
  `;
  container.appendChild(styleEl);

  // References
  const statEngine = container.querySelector('#stat-engine');
  const statTotalItems = container.querySelector('#stat-total-items');
  const statCatCount = container.querySelector('#stat-categories-count');
  const statAiLogs = container.querySelector('#stat-ai-logs');
  const schemaViewer = container.querySelector('#schema-viewer');
  const inspectHeaders = container.querySelector('#inspect-headers');
  const inspectRows = container.querySelector('#inspect-rows');
  const refreshBtn = container.querySelector('#btn-refresh-stats');

  const schemas = {
    items_table: {
      sql: `CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT, -- JSON Array
  status TEXT DEFAULT 'active',
  author TEXT,
  file_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`,
      columns: [
        { name: 'id', type: 'TEXT (PK)', desc: 'Unique record identifier' },
        { name: 'title', type: 'TEXT', desc: 'Document headline / document title' },
        { name: 'category', type: 'TEXT', desc: 'Taxonomy grouping (e.g. AI Architecture)' },
        { name: 'content', type: 'TEXT', desc: 'Main document body text or markdown' },
        { name: 'tags', type: 'TEXT (JSON)', desc: 'Stringified JSON array of tags' },
        { name: 'status', type: 'TEXT', desc: 'Record lifecycle state (active/review/archived)' },
        { name: 'author', type: 'TEXT', desc: 'Creator or upload author' },
        { name: 'file_name', type: 'TEXT', desc: 'Associated upload file name if imported' },
        { name: 'created_at', type: 'ISO TIMESTAMP', desc: 'Creation ISO string' }
      ]
    },
    ai_logs_table: {
      sql: `CREATE TABLE IF NOT EXISTS ai_logs (
  id TEXT PRIMARY KEY,
  prompt_summary TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  timestamp TEXT NOT NULL
);`,
      columns: [
        { name: 'id', type: 'TEXT (PK)', desc: 'Unique log entry identifier' },
        { name: 'prompt_summary', type: 'TEXT', desc: 'Truncated prompt string summary' },
        { name: 'model', type: 'TEXT', desc: 'Anthropic Claude model string used' },
        { name: 'tokens', type: 'INTEGER', desc: 'Estimated token usage count' },
        { name: 'timestamp', type: 'ISO TIMESTAMP', desc: 'Execution ISO string' }
      ]
    }
  };

  let activeTable = 'items_table';

  function updateTableSchemaView() {
    const tableData = schemas[activeTable];
    schemaViewer.textContent = tableData.sql;

    inspectHeaders.innerHTML = `
      <th>Column Name</th>
      <th>Data Type</th>
      <th>Field Description</th>
    `;

    inspectRows.innerHTML = tableData.columns.map(c => `
      <tr>
        <td><strong class="text-accent">${c.name}</strong></td>
        <td><span class="badge badge-outline">${c.type}</span></td>
        <td>${c.desc}</td>
      </tr>
    `).join('');
  }

  async function loadStats() {
    try {
      const res = await ApiClient.getDbStats();
      if (res.success && res.stats) {
        statEngine.textContent = res.stats.engine;
        statTotalItems.textContent = res.stats.totalItems;
        statCatCount.textContent = Object.keys(res.stats.categories || {}).length;
        statAiLogs.textContent = res.stats.totalAiLogs;
      }
    } catch (err) {
      showToast(`Failed to load DB stats: ${err.message}`, 'error');
    }
  }

  // Event Listeners for Schema Tabs
  container.querySelectorAll('.schema-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.schema-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTable = tab.dataset.table;
      updateTableSchemaView();
    });
  });

  refreshBtn.addEventListener('click', () => {
    loadStats();
    showToast('Database statistics refreshed.', 'info');
  });

  // Initial load
  loadStats();
  updateTableSchemaView();
}
