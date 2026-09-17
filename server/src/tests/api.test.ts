import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { db } from '../db/database.js';
import authRoutes from '../routes/authRoutes.js';
import analyticsRoutes from '../routes/analyticsRoutes.js';
import postRoutes from '../routes/postRoutes.js';
import platformRoutes from '../routes/platformRoutes.js';
import teamRoutes from '../routes/teamRoutes.js';

const testApp = express();
testApp.use(cors());
testApp.use(express.json());
testApp.get('/api/health', (req, res) => res.json({ status: 'ok' }));
testApp.use('/api/auth', authRoutes);
testApp.use('/api/analytics', analyticsRoutes);
testApp.use('/api/posts', postRoutes);
testApp.use('/api/platforms', platformRoutes);
testApp.use('/api/team', teamRoutes);

describe('OmniSocial API Test Suite', () => {
  let adminToken: string;
  let managerToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    await db.init();
  });

  it('GET /api/health should return ok', async () => {
    const res = await request(testApp).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  describe('Authentication & Demo Login', () => {
    it('should log in as admin via demo-login', async () => {
      const res = await request(testApp)
        .post('/api/auth/demo-login')
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('should log in as manager via demo-login', async () => {
      const res = await request(testApp)
        .post('/api/auth/demo-login')
        .send({ role: 'manager' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('manager');
      managerToken = res.body.token;
    });

    it('should log in as viewer via demo-login', async () => {
      const res = await request(testApp)
        .post('/api/auth/demo-login')
        .send({ role: 'viewer' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('viewer');
      viewerToken = res.body.token;
    });

    it('should reject invalid credentials', async () => {
      const res = await request(testApp)
        .post('/api/auth/login')
        .send({ email: 'fake@dashboard.io', password: 'wrong' });

      expect(res.status).toBe(401);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('Viewer should NOT be allowed to create a post (403 Forbidden)', async () => {
      const res = await request(testApp)
        .post('/api/posts')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          platforms: ['twitter'],
          content: 'Test unauthorized post'
        });

      expect(res.status).toBe(403);
    });

    it('Manager CAN create a post (201 Created)', async () => {
      const res = await request(testApp)
        .post('/api/posts')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          platforms: ['twitter', 'linkedin'],
          content: 'Manager authorized post for cloud benchmark'
        });

      expect(res.status).toBe(201);
      expect(res.body.post.content).toBe('Manager authorized post for cloud benchmark');
    });

    it('Viewer cannot access Team Management (403 Forbidden)', async () => {
      const res = await request(testApp)
        .get('/api/team')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });

    it('Admin CAN access Team Management (200 OK)', async () => {
      const res = await request(testApp)
        .get('/api/team')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.users.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics & Social API Integrations', () => {
    it('GET /api/analytics/overview returns aggregate KPIs and platforms', async () => {
      const res = await request(testApp)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.kpis.totalFollowers).toBeGreaterThan(100000);
      expect(res.body.platforms.length).toBe(5);
    });

    it('GET /api/analytics/historical returns time series', async () => {
      const res = await request(testApp)
        .get('/api/analytics/historical?days=7')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.series).toBeInstanceOf(Array);
    });

    it('GET /api/analytics/sentiment returns net sentiment and logs', async () => {
      const res = await request(testApp)
        .get('/api/analytics/sentiment')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.summary.positivePercent).toBeDefined();
      expect(res.body.logs).toBeInstanceOf(Array);
    });

    it('POST /api/platforms/twitter/test tests connection via adapter', async () => {
      const res = await request(testApp)
        .post('/api/platforms/twitter/test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
