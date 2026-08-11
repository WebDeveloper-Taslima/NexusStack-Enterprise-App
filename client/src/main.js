import { ApiClient } from './api/client.js';
import { renderAiStudio } from './components/aiStudio.js';
import { renderDataHub } from './components/dataHub.js';
import { renderDbExplorer } from './components/dbExplorer.js';
import { renderApiTester } from './components/apiTester.js';
import { renderDbGuide } from './components/dbGuide.js';

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'ri-information-line';
  if (type === 'success') iconClass = 'ri-checkbox-circle-line';
  if (type === 'error') iconClass = 'ri-error-warning-line';

  toast.innerHTML = `
    <i class="${iconClass}" style="font-size: 1.2rem;"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function checkApiHealth() {
  const badge = document.getElementById('health-badge');
  if (!badge) return;

  try {
    const health = await ApiClient.getHealth();
    if (health.status === 'online') {
      badge.className = 'status-indicator online';
      const keyNotice = health.hasClaudeApiKey ? 'Claude API Connected' : 'Mock AI Mode (Keyless)';
      badge.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">Node.js API Online • ${keyNotice}</span>
      `;
    }
  } catch (err) {
    badge.className = 'status-indicator loading';
    badge.innerHTML = `
      <span class="status-dot" style="background: var(--accent-rose)"></span>
      <span class="status-text">API Disconnected (Port 3001)</span>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-tab');
  const panes = document.querySelectorAll('.tab-pane');

  const tabRenderers = {
    'ai-studio': (el) => renderAiStudio(el, showToast),
    'data-hub': (el) => renderDataHub(el, showToast),
    'db-explorer': (el) => renderDbExplorer(el, showToast),
    'api-tester': (el) => renderApiTester(el, showToast),
    'db-guide': (el) => renderDbGuide(el, showToast)
  };

  const initializedTabs = new Set();

  function activateTab(tabId) {
    tabs.forEach(t => {
      if (t.dataset.tab === tabId) t.classList.add('active');
      else t.classList.remove('active');
    });

    panes.forEach(p => {
      if (p.id === `tab-${tabId}`) {
        p.classList.add('active');
        if (!initializedTabs.has(tabId)) {
          if (tabRenderers[tabId]) {
            tabRenderers[tabId](p);
            initializedTabs.add(tabId);
          }
        }
      } else {
        p.classList.remove('active');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab.dataset.tab);
    });
  });

  activateTab('ai-studio');
  checkApiHealth();
  setInterval(checkApiHealth, 15000);
});
