import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import { AdapterFactory } from '../adapters/adapterFactory.js';
import { wsHub } from '../services/websocket.js';
import { Post, PlatformType } from '../types/index.js';

const router = Router();

// Get all posts (accessible to all authenticated roles)
router.get('/', authenticateJWT, (req: AuthRequest, res: Response): void => {
  const status = req.query.status as string;
  const platform = req.query.platform as string;

  let posts = db.getPosts();

  if (status) {
    posts = posts.filter(p => p.status === status);
  }

  if (platform) {
    posts = posts.filter(p => p.platforms.includes(platform as PlatformType));
  }

  res.json({ posts });
});

// Create / Schedule Post (Manager & Admin only)
router.post('/', authenticateJWT, requireRole('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { platforms, content, mediaUrl, scheduledAt, isDraft } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Post content cannot be empty.' });
      return;
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      res.status(400).json({ error: 'Select at least one social media platform.' });
      return;
    }

    const now = new Date().toISOString();
    let status: 'published' | 'scheduled' | 'draft' = 'published';

    if (isDraft) {
      status = 'draft';
    } else if (scheduledAt && new Date(scheduledAt) > new Date()) {
      status = 'scheduled';
    }

    const newPost: Post = {
      id: `post_${Date.now()}`,
      platforms,
      content,
      mediaUrl: mediaUrl || undefined,
      status,
      scheduledAt: status === 'scheduled' ? new Date(scheduledAt).toISOString() : undefined,
      publishedAt: status === 'published' ? now : undefined,
      createdAt: now,
      authorId: req.user!.id,
      authorName: req.user!.name,
      metrics: status === 'published' ? {
        likes: 0,
        comments: 0,
        shares: 0,
        impressions: 0,
        clicks: 0
      } : undefined
    };

    // If immediate publish, call adapter for each selected platform
    if (status === 'published') {
      for (const plt of platforms) {
        const account = db.getPlatform(plt);
        if (account) {
          const adapter = AdapterFactory.getAdapter(account);
          await adapter.publishPost(content, mediaUrl);
        }
      }
    }

    const savedPost = db.createPost(newPost);

    db.addAuditLog({
      id: `aud_${Date.now()}`,
      userId: req.user!.id,
      userName: req.user!.name,
      action: status === 'scheduled' ? 'POST_SCHEDULED' : status === 'published' ? 'POST_PUBLISHED' : 'POST_DRAFTED',
      details: `Created post for [${platforms.join(', ')}] with status: ${status}`,
      timestamp: now
    });

    // Broadcast WebSocket event
    wsHub.broadcast({
      type: 'POST_CREATED',
      data: savedPost
    });

    res.status(201).json({
      message: status === 'scheduled' ? 'Post scheduled successfully' : status === 'published' ? 'Post published successfully' : 'Draft saved',
      post: savedPost
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating post' });
  }
});

// Update Post (Manager & Admin only)
router.put('/:id', authenticateJWT, requireRole('admin', 'manager'), (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body;

  const existing = db.getPostById(id);
  if (!existing) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const updated = db.updatePost(id, updates);
  res.json({ message: 'Post updated successfully', post: updated });
});

// Delete Post (Manager & Admin only)
router.delete('/:id', authenticateJWT, requireRole('admin', 'manager'), (req: AuthRequest, res: Response): void => {
  const { id } = req.params;

  const existing = db.getPostById(id);
  if (!existing) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  db.deletePost(id);
  res.json({ message: 'Post deleted successfully', id });
});

// Publish scheduled or draft post immediately (Manager & Admin only)
router.post('/:id/publish', authenticateJWT, requireRole('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = db.getPostById(id);

  if (!existing) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const now = new Date().toISOString();
  for (const plt of existing.platforms) {
    const account = db.getPlatform(plt);
    if (account) {
      const adapter = AdapterFactory.getAdapter(account);
      await adapter.publishPost(existing.content, existing.mediaUrl);
    }
  }

  const updated = db.updatePost(id, {
    status: 'published',
    publishedAt: now,
    metrics: {
      likes: Math.floor(Math.random() * 10) + 1,
      comments: 0,
      shares: 0,
      impressions: Math.floor(Math.random() * 150) + 50,
      clicks: Math.floor(Math.random() * 10)
    }
  });

  res.json({ message: 'Post published immediately', post: updated });
});

export default router;
