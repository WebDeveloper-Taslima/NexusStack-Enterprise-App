export function renderDbGuide(container, showToast) {
  container.innerHTML = `
    <div class="db-guide-container">
      
      <!-- Banner / Header -->
      <div class="glass-card mb-4 guide-banner">
        <div class="banner-content">
          <h2 class="banner-title">
            <i class="ri-compass-3-fill gradient-text"></i>
            Architectural Guidance: SQL vs. NoSQL Selection Matrix
          </h2>
          <p class="banner-desc">
            Selecting the right data store depends on your application's data structure, query patterns, and AI integration goals. Use this interactive matrix to evaluate trade-offs.
          </p>
        </div>
      </div>

      <!-- Interactive Scenario Selector -->
      <div class="glass-card mb-4">
        <div class="card-header">
          <h3 class="card-title"><i class="ri-lightbulb-line"></i> Select Your Application Use-Case</h3>
        </div>
        <div class="scenario-buttons">
          <button class="scenario-btn active" data-scenario="fullstack-ai">
            <i class="ri-robot-2-line"></i> Full-Stack JS + Claude AI (Our Stack)
          </button>
          <button class="scenario-btn" data-scenario="saas-billing">
            <i class="ri-bank-card-line"></i> Financial / SaaS Transactional System
          </button>
          <button class="scenario-btn" data-scenario="unstructured-logs">
            <i class="ri-file-text-line"></i> Unstructured Analytics & Event Stream
          </button>
          <button class="scenario-btn" data-scenario="social-graph">
            <i class="ri-share-line"></i> High-Scale Document Catalog
          </button>
        </div>

        <div id="scenario-recommendation" class="recommendation-box mt-3">
          <!-- Filled dynamically -->
        </div>
      </div>

      <!-- Feature Comparison Matrix Table -->
      <div class="glass-card">
        <div class="card-header">
          <h3 class="card-title"><i class="ri-scales-3-line"></i> Feature-by-Feature Comparison Matrix</h3>
        </div>

        <div class="table-responsive">
          <table class="custom-table matrix-table">
            <thead>
              <tr>
                <th>Architectural Dimension</th>
                <th class="text-indigo">Relational SQL (PostgreSQL / SQLite)</th>
                <th class="text-violet">NoSQL (MongoDB / DynamoDB)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Data Model</strong></td>
                <td>Structured tables, rows, foreign key relationships</td>
                <td>Flexible, schema-less JSON/BSON documents</td>
              </tr>
              <tr>
                <td><strong>ACID & Transactions</strong></td>
                <td><span class="badge badge-emerald">Full ACID Out-of-the-Box</span></td>
                <td>Document-level ACID; Eventual Consistency</td>
              </tr>
              <tr>
                <td><strong>AI / Vector Search</strong></td>
                <td><span class="badge badge-accent">Native pgvector Support</span> for embeddings</td>
                <td>MongoDB Atlas Vector Search addon</td>
              </tr>
              <tr>
                <td><strong>Scalability Pattern</strong></td>
                <td>Vertical scaling + Read Replicas + Citus sharding</td>
                <td>Native horizontal sharding across clusters</td>
              </tr>
              <tr>
                <td><strong>Local Development</strong></td>
                <td>Zero-config SQLite file (<code class="inline-code">app.db</code>)</td>
                <td>Requires MongoDB server / Docker container</td>
              </tr>
              <tr>
                <td><strong>Best Cloud Providers</strong></td>
                <td>Supabase, Neon, Render, AWS RDS</td>
                <td>MongoDB Atlas, AWS DynamoDB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Additional CSS specific to DB Guide
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .guide-banner {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
      border-color: rgba(99, 102, 241, 0.3);
    }
    .banner-title { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem; }
    .banner-desc { color: var(--text-muted); font-size: 0.95rem; max-width: 900px; }

    .scenario-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 0.75rem;
    }
    .scenario-btn {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      transition: var(--transition-fast);
    }
    .scenario-btn:hover {
      border-color: var(--accent-primary);
      color: var(--text-main);
    }
    .scenario-btn.active {
      background: var(--accent-primary);
      color: #fff;
      border-color: var(--accent-primary);
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }
    .recommendation-box {
      background: rgba(15, 23, 42, 0.9);
      border-left: 4px solid var(--accent-emerald);
      padding: 1.25rem;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
    }
    .recommendation-heading { font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem; }
    .recommendation-text { font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; }
    .text-indigo { color: #818cf8; }
    .text-violet { color: #a78bfa; }
    .matrix-table th { font-size: 0.95rem; }
    .mt-3 { margin-top: 1rem; }
  `;
  container.appendChild(styleEl);

  const scenarioDiv = container.querySelector('#scenario-recommendation');
  const scenarioBtns = container.querySelectorAll('.scenario-btn');

  const scenarios = {
    'fullstack-ai': {
      title: '🏆 Recommendation: Relational SQL (PostgreSQL / SQLite)',
      description: 'For building a modern full-stack web app with Claude AI integration and user documents, <strong>SQL</strong> provides structured schemas, ACID transactional safety for document CRUD, and seamless vector search capability via <code>pgvector</code>. Local dev uses zero-config SQLite, deploying seamlessly to Supabase or Render in production.'
    },
    'saas-billing': {
      title: '💳 Recommendation: Relational SQL (PostgreSQL)',
      description: 'Financial transactions, subscriptions, and user permissions demand strict ACID compliance, foreign key integrity, and zero eventual consistency risk. PostgreSQL is the industry standard for financial & billing logic.'
    },
    'unstructured-logs': {
      title: '⚡ Recommendation: NoSQL (MongoDB / DynamoDB)',
      description: 'When ingesting high-volume unstructured event streams or heterogeneous IoT payloads where attributes vary dynamically per event, NoSQL document stores offer flexible schema-less ingestion and horizontal partitioning.'
    },
    'social-graph': {
      title: '📄 Recommendation: NoSQL Document Store (MongoDB)',
      description: 'Ideal when records are self-contained JSON documents with variable fields that rarely require complex relational JOIN queries.'
    }
  };

  function updateScenario(key) {
    const data = scenarios[key];
    scenarioDiv.innerHTML = `
      <div class="recommendation-heading">${data.title}</div>
      <div class="recommendation-text">${data.description}</div>
    `;
  }

  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateScenario(btn.dataset.scenario);
    });
  });

  // Initial
  updateScenario('fullstack-ai');
}
