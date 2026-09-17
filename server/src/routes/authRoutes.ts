import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { authenticateJWT, AuthRequest, JWT_SECRET } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = db.createUser({
      id: `usr_${Date.now()}`,
      name,
      email,
      passwordHash,
      role: 'viewer', // default role
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    db.addAuditLog({
      id: `aud_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action: 'USER_LOGIN',
      details: `User logged in with role ${user.role}`,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 1-Click Demo Login
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body as { role: UserRole };
    const validRoles: UserRole[] = ['admin', 'manager', 'viewer'];

    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ error: 'Role must be admin, manager, or viewer' });
      return;
    }

    const emailMap: Record<UserRole, string> = {
      admin: 'admin@dashboard.io',
      manager: 'manager@dashboard.io',
      viewer: 'viewer@dashboard.io'
    };

    const user = db.getUserByEmail(emailMap[role]);
    if (!user) {
      res.status(404).json({ error: `Demo user for role ${role} not found` });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: `Demo login as ${role} successful`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Current User Profile
router.get('/me', authenticateJWT, (req: AuthRequest, res: Response): void => {
  res.json({ user: req.user });
});

export default router;
