import { ApiClient } from '../api/client.js';

export function renderDataHub(container, showToast) {
  container.innerHTML = `
    <div class="data-hub-container">
      
      <!-- Top Control Bar -->
      <div class="glass-card mb-4">
        <div class="control-bar-content">
          <div class="search-filter-group">
            <div class="search-input-wrapper">
              <i class="ri-search-line search-icon"></i>
              <input type="text" id="crud-search" class="form-input search-input" placeholder="Search title, content, or author..." />
            </div>

            <select id="crud-category-filter" class="form-select filter-select">
              <option value="">All Categories</option>
              <option value="AI Architecture">AI Architecture</option>
              <option value="Database Design">Database Design</option>
              <option value="Backend Development">Backend Development</option>
              <option value="General">General</option>
            </select>
          </div>

          <div class="action-buttons-group">
            <button id="btn-open-upload-modal" class="btn btn-secondary">
              <i class="ri-upload-cloud-2-line"></i>
              <span>Upload Data / File</span>
            </button>
            <button id="btn-open-create-modal" class="btn btn-primary">
              <i class="ri-add-line"></i>
              <span>New Document</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Data Table / Cards Grid -->
      <div class="glass-card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="ri-table-line gradient-text"></i>
            User-Generated Data Store
          </h2>
          <span id="record-count-badge" class="badge badge-accent">0 Records</span>
        </div>

        <div id="data-items-list" class="items-grid">
          <div class="loading-state">
            <i class="ri-loader-4-line ri-spin spinner-icon"></i>
            <p>Loading database records...</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Create / Edit Document Modal -->
    <div id="item-modal" class="modal-backdrop hidden">
      <div class="modal-card">
        <div class="modal-header">
          <h3 id="modal-title" class="modal-heading">Create New Document</h3>
          <button id="btn-close-modal" class="modal-close-btn">&times;</button>
        </div>
        <form id="item-form">
          <input type="hidden" id="item-id" />
          <div class="form-group">
            <label class="form-label">Document Title *</label>
            <input type="text" id="item-title" class="form-input" required placeholder="e.g. Supabase Schema Migration Strategy" />
          </div>
          
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Category</label>
              <input type="text" id="item-category" class="form-input" placeholder="e.g. Database Architecture" />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Author</label>
              <input type="text" id="item-author" class="form-input" placeholder="e.g. Lead Engineer" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tags (comma separated)</label>
            <input type="text" id="item-tags" class="form-input" placeholder="node, express, database" />
          </div>

          <div class="form-group">
            <label class="form-label">Content / Body *</label>
            <textarea id="item-content" class="form-textarea" rows="5" required placeholder="Enter markdown or plain text details..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" id="btn-cancel-modal" class="btn btn-secondary">Cancel</button>
            <button type="submit" id="btn-save-item" class="btn btn-primary">Save Document</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Data Upload Workflow Modal -->
    <div id="upload-modal" class="modal-backdrop hidden">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-heading">Data Upload Workflow</h3>
          <button id="btn-close-upload-modal" class="modal-close-btn">&times;</button>
        </div>
        
        <div class="upload-workflow-body">
          <p class="text-muted text-sm mb-3">Upload local JSON, CSV, or plain text files to automatically process and ingest records into the SQL/NoSQL database store.</p>

          <!-- Dropzone -->
          <div id="file-dropzone" class="dropzone">
            <i class="ri-upload-cloud-fill dropzone-icon"></i>
            <p class="dropzone-text">Drag & drop files here or <span class="text-accent cursor-pointer">browse</span></p>
            <span class="dropzone-hint">Supports .json, .csv, and .txt files (Max 5MB)</span>
            <input type="file" id="file-input" class="hidden-file-input" accept=".json,.csv,.txt" />
          </div>

          <div id="file-info" class="file-info-box hidden">
            <i class="ri-file-text-line"></i>
            <span id="selected-file-name">filename.json</span>
            <button id="btn-remove-file" class="btn-icon">&times;</button>
          </div>

          <div class="or-divider">OR Paste Raw JSON Array</div>

          <div class="form-group">
            <textarea id="raw-json-input" class="form-textarea" rows="4" placeholder='[ { "title": "Sample 1", "content": "..." } ]'></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" id="btn-cancel-upload" class="btn btn-secondary">Cancel</button>
            <button type="button" id="btn-submit-upload" class="btn btn-primary">Process & Ingest Data</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Additional CSS specific to Data Hub
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .control-bar-content {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .search-filter-group {
      display: flex;
      gap: 0.75rem;
      flex: 1;
      min-width: 280px;
    }
    .search-input-wrapper {
      position: relative;
      flex: 1;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-dim);
    }
    .search-input {
      padding-left: 2.5rem;
    }
    .filter-select {
      width: 200px;
    }
    .action-buttons-group {
      display: flex;
      gap: 0.75rem;
    }
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.25rem;
      margin-top: 1rem;
    }
    .item-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: var(--transition-fast);
    }
    .item-card:hover {
      border-color: var(--accent-primary);
      transform: translateY(-2px);
    }
    .item-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .item-card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.3;
    }
    .item-card-body {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .item-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-color);
      padding-top: 0.75rem;
      font-size: 0.78rem;
      color: var(--text-dim);
    }
    .item-actions {
      display: flex;
      gap: 0.4rem;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-backdrop.hidden { display: none; }
    .modal-card {
      background: #0f172a;
      border: 1px solid var(--border-highlight);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 600px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .modal-heading { font-family: var(--font-heading); font-size: 1.2rem; }
    .modal-close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
    .form-row { display: flex; gap: 1rem; }
    .dropzone {
      border: 2px dashed var(--border-highlight);
      border-radius: var(--radius-md);
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      background: rgba(15, 23, 42, 0.4);
      transition: var(--transition-fast);
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: var(--accent-cyan);
      background: rgba(6, 182, 212, 0.05);
    }
    .dropzone-icon { font-size: 2.5rem; color: var(--accent-cyan); margin-bottom: 0.5rem; }
    .hidden-file-input { display: none; }
    .file-info-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      margin-top: 1rem;
    }
    .or-divider {
      text-align: center;
      margin: 1rem 0;
      font-size: 0.8rem;
      color: var(--text-dim);
    }
    .mb-4 { margin-bottom: 1.5rem; }
  `;
  container.appendChild(styleEl);

  // References
  const searchInput = container.querySelector('#crud-search');
  const categoryFilter = container.querySelector('#crud-category-filter');
  const itemsList = container.querySelector('#data-items-list');
  const recordCountBadge = container.querySelector('#record-count-badge');

  // Modal references
  const itemModal = container.querySelector('#item-modal');
  const itemForm = container.querySelector('#item-form');
  const modalTitle = container.querySelector('#modal-title');
  const itemIdInput = container.querySelector('#item-id');
  const itemTitleInput = container.querySelector('#item-title');
  const itemCatInput = container.querySelector('#item-category');
  const itemAuthorInput = container.querySelector('#item-author');
  const itemTagsInput = container.querySelector('#item-tags');
  const itemContentInput = container.querySelector('#item-content');

  // Upload modal references
  const uploadModal = container.querySelector('#upload-modal');
  const dropzone = container.querySelector('#file-dropzone');
  const fileInput = container.querySelector('#file-input');
  const fileInfo = container.querySelector('#file-info');
  const selectedFileName = container.querySelector('#selected-file-name');
  const rawJsonInput = container.querySelector('#raw-json-input');

  let selectedFile = null;

  // Load and Render Items
  async function loadItems() {
    try {
      const res = await ApiClient.getItems(searchInput.value.trim(), categoryFilter.value);
      if (res.success && res.items) {
        recordCountBadge.textContent = `${res.count} Record${res.count === 1 ? '' : 's'}`;

        if (res.items.length === 0) {
          itemsList.innerHTML = `
            <div class="empty-state">
              <i class="ri-inbox-line empty-icon"></i>
              <p>No document records found matching your filters.</p>
            </div>
          `;
          return;
        }

        itemsList.innerHTML = res.items.map(item => `
          <div class="item-card" data-id="${item.id}">
            <div>
              <div class="item-card-header">
                <div class="item-card-title">${escapeHtml(item.title)}</div>
                <span class="badge badge-accent">${escapeHtml(item.category || 'General')}</span>
              </div>
              <div class="item-card-body">${escapeHtml(item.content)}</div>
            </div>
            <div class="item-card-footer">
              <span><i class="ri-user-3-line"></i> ${escapeHtml(item.author || 'Anonymous')}</span>
              <div class="item-actions">
                <button class="btn btn-secondary btn-sm btn-edit-item" data-id="${item.id}" title="Edit">
                  <i class="ri-edit-line"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-delete-item" data-id="${item.id}" title="Delete">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');

        // Attach Card Button Handlers
        itemsList.querySelectorAll('.btn-edit-item').forEach(btn => {
          btn.addEventListener('click', () => openEditModal(btn.dataset.id, res.items));
        });

        itemsList.querySelectorAll('.btn-delete-item').forEach(btn => {
          btn.addEventListener('click', () => handleDelete(btn.dataset.id));
        });
      }
    } catch (err) {
      showToast(`Failed to load items: ${err.message}`, 'error');
    }
  }

  // Filter Listeners
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadItems, 300);
  });

  categoryFilter.addEventListener('change', loadItems);

  // Open Create Modal
  container.querySelector('#btn-open-create-modal').addEventListener('click', () => {
    modalTitle.textContent = 'Create New Document';
    itemForm.reset();
    itemIdInput.value = '';
    itemModal.classList.remove('hidden');
  });

  // Open Edit Modal
  function openEditModal(id, items) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    modalTitle.textContent = 'Edit Document';
    itemIdInput.value = item.id;
    itemTitleInput.value = item.title;
    itemCatInput.value = item.category || '';
    itemAuthorInput.value = item.author || '';
    itemTagsInput.value = Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '');
    itemContentInput.value = item.content;

    itemModal.classList.remove('hidden');
  }

  // Close Item Modal
  container.querySelector('#btn-close-modal').addEventListener('click', () => itemModal.classList.add('hidden'));
  container.querySelector('#btn-cancel-modal').addEventListener('click', () => itemModal.classList.add('hidden'));

  // Save Item (Create or Update)
  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = itemIdInput.value;
    const itemData = {
      title: itemTitleInput.value.trim(),
      category: itemCatInput.value.trim() || 'General',
      author: itemAuthorInput.value.trim() || 'User',
      tags: itemTagsInput.value.trim(),
      content: itemContentInput.value.trim()
    };

    try {
      if (id) {
        await ApiClient.updateItem(id, itemData);
        showToast('Document updated successfully!', 'success');
      } else {
        await ApiClient.createItem(itemData);
        showToast('New document created!', 'success');
      }
      itemModal.classList.add('hidden');
      loadItems();
    } catch (err) {
      showToast(`Error saving document: ${err.message}`, 'error');
    }
  });

  // Delete Item
  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await ApiClient.deleteItem(id);
        showToast('Document deleted.', 'info');
        loadItems();
      } catch (err) {
        showToast(`Delete failed: ${err.message}`, 'error');
      }
    }
  }

  // Upload Modal Handlers
  const openUploadBtn = container.querySelector('#btn-open-upload-modal');
  openUploadBtn.addEventListener('click', () => uploadModal.classList.remove('hidden'));
  container.querySelector('#btn-close-upload-modal').addEventListener('click', () => uploadModal.classList.add('hidden'));
  container.querySelector('#btn-cancel-upload').addEventListener('click', () => uploadModal.classList.add('hidden'));

  // File Dropzone Interaction
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  function handleFileSelected(file) {
    selectedFile = file;
    selectedFileName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    fileInfo.classList.remove('hidden');
  }

  container.querySelector('#btn-remove-file').addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.classList.add('hidden');
  });

  // Process & Ingest Data Upload
  container.querySelector('#btn-submit-upload').addEventListener('click', async () => {
    const rawJson = rawJsonInput.value.trim();

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await ApiClient.uploadData(formData);
        showToast(res.message || 'File uploaded & processed successfully!', 'success');
      } else if (rawJson) {
        let parsed = JSON.parse(rawJson);
        const res = await ApiClient.createItem({ items: Array.isArray(parsed) ? parsed : [parsed] });
        showToast('JSON payload ingested successfully!', 'success');
      } else {
        showToast('Please select a file or paste raw JSON first.', 'error');
        return;
      }

      uploadModal.classList.add('hidden');
      selectedFile = null;
      fileInput.value = '';
      rawJsonInput.value = '';
      fileInfo.classList.add('hidden');
      loadItems();
    } catch (err) {
      showToast(`Upload failed: ${err.message}`, 'error');
    }
  });

  // Initial Load
  loadItems();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
