import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiRoutes from './routes/aiRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  if (req.originalUrl !== '/api/health') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api', itemRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    hasClaudeApiKey: !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== '')
  });
});

// Serve Client Static Assets (Production / Preview)
const clientBuildPath = path.join(__dirname, '../client/dist');
const clientPublicPath = path.join(__dirname, '../client');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    if (!req.originalUrl.startsWith('/api')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
  });
} else {
  // In development, serve raw frontend static files if accessed directly
  app.use(express.static(clientPublicPath));
}

// 404 Fallback for unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Global Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  🔗 API Health: http://localhost:${PORT}/api/health
  🤖 Claude AI Endpoint: http://localhost:${PORT}/api/ai/stream
  💾 CRUD Endpoint: http://localhost:${PORT}/api/items
  `);
});
