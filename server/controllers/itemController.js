import { Database } from '../config/database.js';

export const itemController = {
  getItems(req, res) {
    try {
      const { q, category } = req.query;
      const items = Database.getAllItems(q, category);
      res.json({
        success: true,
        count: items.length,
        items
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getItemById(req, res) {
    try {
      const item = Database.getItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Document not found.' });
      }
      res.json({ success: true, item });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  createItem(req, res) {
    try {
      const { title, category, content, tags, status, author } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, error: 'Title and content are required fields.' });
      }

      const newItem = Database.createItem({
        title,
        category: category || 'General',
        content,
        tags,
        status: status || 'active',
        author: author || 'User'
      });

      res.status(201).json({
        success: true,
        message: 'Document created successfully.',
        item: newItem
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateItem(req, res) {
    try {
      const updated = Database.updateItem(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Document not found.' });
      }
      res.json({
        success: true,
        message: 'Document updated successfully.',
        item: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  deleteItem(req, res) {
    try {
      const deleted = Database.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Document not found.' });
      }
      res.json({
        success: true,
        message: 'Document deleted successfully.',
        id: req.params.id
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  uploadData(req, res) {
    try {
      // Handles uploaded files or direct JSON payload bulk insert
      let recordsToInsert = [];

      if (req.file) {
        const fileContent = req.file.buffer.toString('utf8');
        const filename = req.file.originalname;

        if (filename.endsWith('.json')) {
          const parsed = JSON.parse(fileContent);
          recordsToInsert = Array.isArray(parsed) ? parsed : [parsed];
        } else if (filename.endsWith('.csv')) {
          // Simple CSV parsing
          const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
              const recordObj = {};
              headers.forEach((h, idx) => {
                recordObj[h] = cols[idx] || '';
              });
              recordObj.file_name = filename;
              recordsToInsert.push(recordObj);
            }
          }
        } else {
          // Plain text document
          recordsToInsert.push({
            title: filename,
            category: 'Text Upload',
            content: fileContent,
            file_name: filename
          });
        }
      } else if (req.body && req.body.items && Array.isArray(req.body.items)) {
        recordsToInsert = req.body.items;
      } else if (req.body && req.body.content) {
        recordsToInsert = [req.body];
      }

      if (recordsToInsert.length === 0) {
        return res.status(400).json({ success: false, error: 'No valid data or file content provided for upload.' });
      }

      const inserted = Database.bulkInsert(recordsToInsert);

      res.status(201).json({
        success: true,
        message: `Successfully processed and uploaded ${inserted.length} document(s) to database.`,
        count: inserted.length,
        items: inserted
      });
    } catch (err) {
      res.status(500).json({ success: false, error: `Upload processing failed: ${err.message}` });
    }
  },

  getDbStats(req, res) {
    try {
      const stats = Database.getDbStats();
      res.json({ success: true, stats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
