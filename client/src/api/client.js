/**
 * NexusStack API Client Module
 * Interacts with Node.js Express backend and handles SSE token streaming.
 */

const API_BASE = '/api';

export const ApiClient = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  async getPromptTemplates() {
    const res = await fetch(`${API_BASE}/ai/prompts`);
    return await res.json();
  },

  async getItems(searchQuery = '', categoryFilter = '') {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (categoryFilter) params.append('category', categoryFilter);

    const res = await fetch(`${API_BASE}/items?${params.toString()}`);
    return await res.json();
  },

  async getItemById(id) {
    const res = await fetch(`${API_BASE}/items/${id}`);
    return await res.json();
  },

  async createItem(itemData) {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    return await res.json();
  },

  async updateItem(id, itemData) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    return await res.json();
  },

  async deleteItem(id) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async uploadData(formData) {
    const res = await fetch(`${API_BASE}/items/upload`, {
      method: 'POST',
      body: formData // FormData automatically sets correct multipart headers
    });
    return await res.json();
  },

  async getDbStats() {
    const res = await fetch(`${API_BASE}/db/stats`);
    return await res.json();
  },

  /**
   * Reads Claude AI Server-Sent Events (SSE) token stream from /api/ai/stream
   */
  async streamClaudeAi({ prompt, systemPrompt, model, temperature }, onChunk, onEnd, onError) {
    try {
      const response = await fetch(`${API_BASE}/ai/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemPrompt, model, temperature })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete trailing chunk

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace(/^data: /, '').trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              if (data.type === 'chunk' && onChunk) {
                onChunk(data.content);
              } else if (data.type === 'error' && onError) {
                onError(data.error);
              } else if (data.type === 'end' && onEnd) {
                onEnd(data);
              }
            } catch (parseErr) {
              console.warn('Failed to parse SSE JSON:', parseErr, dataStr);
            }
          }
        }
      }
    } catch (err) {
      if (onError) onError(err.message || 'Stream connection interrupted');
    }
  }
};
