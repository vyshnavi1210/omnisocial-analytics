import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

// All routes in team management require 'admin' role
router.use(authenticateJWT, requireRole('admin'));

// List all team members
router.get('/', (req: AuthRequest, res: Response): void => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    createdAt: u.createdAt
  }));
  const auditLogs = db.getAuditLogs().slice(0, 30);

  res.json({ users, auditLogs });
});

// Invite / add a team member
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }

    const assignedRole: UserRole = ['admin', 'manager', 'viewer'].includes(role) ? role : 'viewer';
    const initialPassword = password || 'Welcome@123';
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const newUser = db.createUser({
      id: `usr_${Date.now()}`,
      name,
      email,
      passwordHash,
      role: assignedRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    });

    db.addAuditLog({
      id: `aud_${Date.now()}`,
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'TEAM_MEMBER_ADDED',
      details: `Added new user ${name} (${email}) with role ${assignedRole}`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Team member created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add team member' });
  }
});

// Update member role
router.patch('/:id/role', (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'manager', 'viewer'].includes(role)) {
    res.status(400).json({ error: 'Role must be admin, manager, or viewer' });
    return;
  }

  // Prevent self-demotion from admin
  if (req.user!.id === id && role !== 'admin') {
    res.status(400).json({ error: 'You cannot change your own admin role to a lower privilege.' });
    return;
  }

  const updated = db.updateUserRole(id, role);
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  db.addAuditLog({
    id: `aud_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'ROLE_CHANGED',
    details: `Updated role of ${updated.name} to ${role}`,
    timestamp: new Date().toISOString()
  });

  res.json({
    message: `Role updated to ${role}`,
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar
    }
  });
});

// Delete team member
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  const { id } = req.params;

  if (req.user!.id === id) {
    res.status(400).json({ error: 'You cannot delete your own user account.' });
    return;
  }

  const user = db.getUserById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  db.deleteUser(id);

  db.addAuditLog({
    id: `aud_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'TEAM_MEMBER_REMOVED',
    details: `Removed user ${user.name} (${user.email})`,
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'User removed successfully', id });
});

export default router;
