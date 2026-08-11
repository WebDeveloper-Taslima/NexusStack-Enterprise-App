import { ApiClient } from '../api/client.js';

export function renderAiStudio(container, showToast) {
  container.innerHTML = `
    <div class="ai-studio-grid">
      
      <!-- Left Column: Controls & Prompt Presets -->
      <div class="studio-controls-column">
        <div class="glass-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="ri-sparkles-line gradient-text"></i>
              Claude AI Prompt Studio
            </h2>
            <span class="badge badge-accent" id="model-badge">Claude 3.5 Sonnet</span>
          </div>

          <!-- Prompt Presets Selector -->
          <div class="form-group">
            <label class="form-label">Featured Prompt Engineering Templates</label>
            <div id="prompt-presets" class="presets-container">
              <div class="preset-skeleton">Loading templates...</div>
            </div>
          </div>

          <!-- Model & Controls -->
          <div class="controls-row">
            <div class="form-group flex-1">
              <label class="form-label">Claude Model</label>
              <select id="ai-model" class="form-select">
                <option value="claude-3-5-sonnet-20241022" selected>Claude 3.5 Sonnet (High Intelligence)</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku (Light & Fast)</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Temperature: <span id="temp-val">0.7</span></label>
              <input type="range" id="ai-temp" min="0" max="1" step="0.1" value="0.7" class="form-range" />
            </div>
          </div>

          <!-- System Prompt Collapsible -->
          <div class="form-group">
            <div class="system-prompt-toggle">
              <label class="form-label">System Prompt (Context & Persona)</label>
            </div>
            <textarea id="system-prompt" class="form-textarea" rows="2" placeholder="e.g. You are an expert Full-Stack JavaScript Architect..."></textarea>
          </div>

          <!-- Prompt Input -->
          <div class="form-group">
            <label class="form-label">User Prompt / Coding Task</label>
            <textarea id="user-prompt" class="form-textarea" rows="4" placeholder="Type your instruction or choose a preset template above..."></textarea>
          </div>

          <!-- Submit Button -->
          <div class="action-buttons">
            <button id="btn-stream-ai" class="btn btn-primary btn-block">
              <i class="ri-send-plane-fill"></i>
              <span>Generate Streaming Response</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Real-time SSE Stream Output -->
      <div class="studio-output-column">
        <div class="glass-card full-height">
          <div class="card-header">
            <h2 class="card-title">
              <i class="ri-terminal-window-line"></i>
              Real-time Token Stream Output
            </h2>
            <div class="output-actions">
              <span id="stream-status-badge" class="badge badge-outline">Idle</span>
              <button id="btn-copy-output" class="btn btn-secondary btn-sm" title="Copy Output">
                <i class="ri-file-copy-line"></i>
                <span>Copy</span>
              </button>
              <button id="btn-clear-output" class="btn btn-secondary btn-sm" title="Clear Window">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>

          <!-- Output Display Window -->
          <div id="stream-output-box" class="stream-output-container">
            <div class="placeholder-text">
              <i class="ri-chat-voice-line placeholder-icon"></i>
              <p>Select a preset template or type a prompt on the left, then click <strong>Generate Streaming Response</strong>.</p>
              <p class="subtext">Tokens will stream in real-time token-by-token via Server-Sent Events (SSE).</p>
            </div>
          </div>

          <!-- Stream Footer Token Stats -->
          <div class="stream-footer">
            <div class="stat-item">
              <span class="stat-label">Estimated Tokens:</span>
              <span id="stat-tokens" class="stat-value">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Protocol:</span>
              <span class="stat-value text-accent">SSE (HTTP/2 Event Stream)</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Additional CSS styles specific to AI Studio
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .ai-studio-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 992px) {
      .ai-studio-grid { grid-template-columns: 1fr; }
    }
    .presets-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .preset-card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .preset-card:hover {
      border-color: var(--accent-primary);
      background: rgba(30, 41, 59, 0.9);
      transform: translateY(-2px);
    }
    .preset-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 0.2rem;
    }
    .preset-category {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .controls-row {
      display: flex;
      gap: 1rem;
    }
    .flex-1 { flex: 1; }
    .btn-block { width: 100%; }
    .full-height { height: 100%; display: flex; flex-direction: column; }
    .output-actions { display: flex; align-items: center; gap: 0.5rem; }
    .placeholder-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 240px;
      color: var(--text-dim);
      text-align: center;
      gap: 0.5rem;
    }
    .placeholder-icon { font-size: 3rem; opacity: 0.4; }
    .stream-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.8rem;
    }
    .text-accent { color: var(--accent-cyan); font-weight: 600; }
  `;
  container.appendChild(styleEl);

  // Attach Event Listeners & Load Templates
  const userPromptInput = container.querySelector('#user-prompt');
  const systemPromptInput = container.querySelector('#system-prompt');
  const modelSelect = container.querySelector('#ai-model');
  const tempInput = container.querySelector('#ai-temp');
  const tempValSpan = container.querySelector('#temp-val');
  const streamBtn = container.querySelector('#btn-stream-ai');
  const outputBox = container.querySelector('#stream-output-box');
  const statusBadge = container.querySelector('#stream-status-badge');
  const statTokens = container.querySelector('#stat-tokens');
  const modelBadge = container.querySelector('#model-badge');

  tempInput.addEventListener('input', (e) => {
    tempValSpan.textContent = e.target.value;
  });

  modelSelect.addEventListener('change', (e) => {
    const isHaiku = e.target.value.includes('haiku');
    modelBadge.textContent = isHaiku ? 'Claude 3 Haiku' : 'Claude 3.5 Sonnet';
  });

  // Fetch Templates
  ApiClient.getPromptTemplates().then((res) => {
    if (res.success && res.templates) {
      const presetsDiv = container.querySelector('#prompt-presets');
      presetsDiv.innerHTML = res.templates.map(t => `
        <div class="preset-card" data-id="${t.id}">
          <div class="preset-title">${t.title}</div>
          <div class="preset-category">${t.category}</div>
        </div>
      `).join('');

      presetsDiv.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', () => {
          const template = res.templates.find(t => t.id === card.dataset.id);
          if (template) {
            userPromptInput.value = template.userPrompt;
            systemPromptInput.value = template.systemPrompt;
            showToast(`Loaded prompt template: ${template.title}`, 'info');
          }
        });
      });
    }
  }).catch(err => console.error('Failed to load prompt templates:', err));

  // Handle Stream Request
  streamBtn.addEventListener('click', async () => {
    const prompt = userPromptInput.value.trim();
    if (!prompt) {
      showToast('Please enter a prompt instruction.', 'error');
      return;
    }

    // UI Streaming State
    streamBtn.disabled = true;
    streamBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Streaming Tokens...`;
    statusBadge.className = 'badge badge-amber';
    statusBadge.textContent = 'Streaming...';
    outputBox.classList.add('streaming');
    outputBox.innerHTML = '<span id="stream-content"></span><span class="cursor-blink"></span>';
    
    const streamContent = outputBox.querySelector('#stream-content');
    let accumulatedText = '';
    let tokenCounter = 0;

    await ApiClient.streamClaudeAi(
      {
        prompt,
        systemPrompt: systemPromptInput.value.trim(),
        model: modelSelect.value,
        temperature: parseFloat(tempInput.value)
      },
      // Chunk Callback
      (chunk) => {
        accumulatedText += chunk;
        tokenCounter += Math.max(1, Math.ceil(chunk.length / 4));
        streamContent.innerHTML = formatMarkdownText(accumulatedText);
        statTokens.textContent = tokenCounter;
        outputBox.scrollTop = outputBox.scrollHeight;
      },
      // End Callback
      (endData) => {
        streamBtn.disabled = false;
        streamBtn.innerHTML = `<i class="ri-send-plane-fill"></i> <span>Generate Streaming Response</span>`;
        outputBox.classList.remove('streaming');
        
        const cursor = outputBox.querySelector('.cursor-blink');
        if (cursor) cursor.remove();

        statusBadge.className = 'badge badge-emerald';
        statusBadge.textContent = endData.isMock ? 'Completed (Mock Stream)' : 'Completed (Claude SDK)';
        showToast('Claude AI response stream completed!', 'success');
      },
      // Error Callback
      (errMsg) => {
        streamBtn.disabled = false;
        streamBtn.innerHTML = `<i class="ri-send-plane-fill"></i> <span>Generate Streaming Response</span>`;
        outputBox.classList.remove('streaming');
        statusBadge.className = 'badge badge-rose';
        statusBadge.textContent = 'Error';
        showToast(`Stream Error: ${errMsg}`, 'error');
      }
    );
  });

  // Copy Output
  container.querySelector('#btn-copy-output').addEventListener('click', () => {
    const content = outputBox.innerText;
    if (content) {
      navigator.clipboard.writeText(content);
      showToast('Output copied to clipboard!', 'success');
    }
  });

  // Clear Output
  container.querySelector('#btn-clear-output').addEventListener('click', () => {
    outputBox.innerHTML = `
      <div class="placeholder-text">
        <i class="ri-chat-voice-line placeholder-icon"></i>
        <p>Select a preset template or type a prompt on the left, then click <strong>Generate Streaming Response</strong>.</p>
      </div>
    `;
    statTokens.textContent = '0';
    statusBadge.className = 'badge badge-outline';
    statusBadge.textContent = 'Idle';
  });
}

// Simple Markdown formatting helper for code blocks and headers
function formatMarkdownText(text) {
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Format code blocks ```lang ... ```
  escaped = escaped.replace(/```([\s\S]*?)```/g, (match, p1) => {
    return `<pre class="code-block">${p1.trim()}</pre>`;
  });

  // Format inline code `code`
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Format bold **bold**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Format headers ### Title
  escaped = escaped.replace(/^### (.*$)/gim, '<h3 class="stream-h3">$1</h3>');
  escaped = escaped.replace(/^## (.*$)/gim, '<h2 class="stream-h2">$1</h2>');

  return escaped;
}
