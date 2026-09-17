import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db } from './db/database.js';
import { wsHub } from './services/websocket.js';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import postRoutes from './routes/postRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OmniSocial Analytics Server',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/team', teamRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Serve frontend static build in production
const clientDist = path.resolve(process.cwd(), '../client/dist');
const localDist = path.resolve(process.cwd(), 'client/dist');
const targetDist = fs.existsSync(clientDist) ? clientDist : fs.existsSync(localDist) ? localDist : null;

if (targetDist) {
  app.use(express.static(targetDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(targetDist, 'index.html'));
  });
}

const httpServer = http.createServer(app);

// Initialize DB and start server
async function bootstrap() {
  try {
    await db.init();
    console.log('Database initialized and seeded.');

    wsHub.init(httpServer);
    console.log('WebSocket hub initialized on /ws');

    httpServer.listen(PORT, () => {
      console.log(`OmniSocial Backend Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

export { app, httpServer };
