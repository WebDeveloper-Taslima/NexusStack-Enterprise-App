import { ApiClient } from '../api/client.js';

export function renderApiTester(container, showToast) {
  container.innerHTML = `
    <div class="api-tester-container">
      <div class="glass-card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="ri-code-s-slash-line gradient-text"></i>
            Interactive Express REST API Inspector & Tester
          </h2>
          <span class="badge badge-emerald">Port 3001 Active</span>
        </div>

        <p class="text-muted mb-4">
          Test backend endpoints, inspect HTTP status codes, headers, and payload structures directly from this console.
        </p>

        <div class="endpoint-card">
          <div>
            <span class="method-badge method-get">GET</span>
            <strong class="endpoint-url">/api/health</strong> — System Health & API Key Detector
          </div>
          <button class="btn btn-secondary btn-sm" data-route="/api/health">Test Endpoint</button>
        </div>

        <div class="endpoint-card">
          <div>
            <span class="method-badge method-get">GET</span>
            <strong class="endpoint-url">/api/items</strong> — List All Document Records
          </div>
          <button class="btn btn-secondary btn-sm" data-route="/api/items">Test Endpoint</button>
        </div>

        <div class="endpoint-card">
          <div>
            <span class="method-badge method-get">GET</span>
            <strong class="endpoint-url">/api/ai/prompts</strong> — Get Prompt Engineering Templates
          </div>
          <button class="btn btn-secondary btn-sm" data-route="/api/ai/prompts">Test Endpoint</button>
        </div>

        <div class="endpoint-card">
          <div>
            <span class="method-badge method-get">GET</span>
            <strong class="endpoint-url">/api/db/stats</strong> — Relational Database Statistics & Audit Logs
          </div>
          <button class="btn btn-secondary btn-sm" data-route="/api/db/stats">Test Endpoint</button>
        </div>

        <div class="form-group mt-4">
          <label class="form-label">Live API JSON Response Payload</label>
          <pre id="api-response-output" class="code-block" style="min-height: 220px;">// Click any endpoint button above to test real-time backend API response...</pre>
        </div>
      </div>
    </div>
  `;

  const output = container.querySelector('#api-response-output');

  container.querySelectorAll('button[data-route]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const route = btn.dataset.route;
      output.textContent = `// Sending HTTP GET request to http://localhost:3001${route}...\n`;

      try {
        let resData = null;
        if (route === '/api/health') resData = await ApiClient.getHealth();
        else if (route === '/api/items') resData = await ApiClient.getItems();
        else if (route === '/api/ai/prompts') resData = await ApiClient.getPromptTemplates();
        else if (route === '/api/db/stats') resData = await ApiClient.getDbStats();

        output.textContent = `// Response HTTP 200 OK (${route})\n` + JSON.stringify(resData, null, 2);
        showToast(`Tested endpoint: ${route}`, 'success');
      } catch (err) {
        output.textContent = `// Error fetching ${route}:\n` + JSON.stringify({ error: err.message }, null, 2);
        showToast(`Endpoint Error: ${err.message}`, 'error');
      }
    });
  });
}
