import fs from 'fs';
import path from 'path';
import DatabaseConstructor from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import {
  User,
  PlatformAccount,
  Post,
  SentimentLog,
  AuditLog,
  PlatformMetricHistory,
  AudienceDemographics
} from '../types/index.js';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'omnisocial.sqlite');

class SQLiteDatabase {
  private db: any = null;
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    this.db = new DatabaseConstructor(DB_FILE);
    this.db.pragma('journal_mode = WAL');

    this.createTables();

    // Check if users exist; if not, seed initial dataset
    const userCount = this.db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
    if (userCount.count === 0) {
      console.log('Seeding initial data into SQLite database...');
      await this.seed();
    }

    this.isInitialized = true;
  }

  private createTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS platforms (
        id TEXT PRIMARY KEY,
        platform TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        handle TEXT NOT NULL,
        avatar TEXT,
        is_connected INTEGER NOT NULL DEFAULT 1,
        is_simulated INTEGER NOT NULL DEFAULT 1,
        api_key TEXT,
        api_secret TEXT,
        access_token TEXT,
        followers_count INTEGER NOT NULL DEFAULT 0,
        following_count INTEGER NOT NULL DEFAULT 0,
        posts_count INTEGER NOT NULL DEFAULT 0,
        engagement_rate REAL NOT NULL DEFAULT 0.0,
        reach_30d INTEGER NOT NULL DEFAULT 0,
        impressions_30d INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        platforms_json TEXT NOT NULL,
        content TEXT NOT NULL,
        media_url TEXT,
        status TEXT NOT NULL,
        scheduled_at TEXT,
        published_at TEXT,
        created_at TEXT NOT NULL,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        metrics_json TEXT
      );

      CREATE TABLE IF NOT EXISTS metrics_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        date TEXT NOT NULL,
        followers INTEGER NOT NULL,
        impressions INTEGER NOT NULL,
        reach INTEGER NOT NULL,
        engagement_rate REAL NOT NULL,
        clicks INTEGER NOT NULL,
        UNIQUE(platform, date)
      );

      CREATE TABLE IF NOT EXISTS sentiment_logs (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        sentiment TEXT NOT NULL,
        score REAL NOT NULL,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS system_metadata (
        key TEXT PRIMARY KEY,
        data_json TEXT NOT NULL
      );
    `);
  }

  private async seed(): Promise<void> {
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const managerHash = await bcrypt.hash('Manager@123', 10);
    const viewerHash = await bcrypt.hash('Viewer@123', 10);
    const now = new Date().toISOString();

    const insertUser = this.db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('usr_admin', 'Sarah Jenkins (Admin)', 'admin@dashboard.io', adminHash, 'admin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', now);
    insertUser.run('usr_manager', 'Marcus Vance (Manager)', 'manager@dashboard.io', managerHash, 'manager', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', now);
    insertUser.run('usr_viewer', 'Elena Rostova (Analyst)', 'viewer@dashboard.io', viewerHash, 'viewer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', now);

    const insertPlatform = this.db.prepare(`
      INSERT INTO platforms (id, platform, name, handle, avatar, is_connected, is_simulated, followers_count, following_count, posts_count, engagement_rate, reach_30d, impressions_30d, last_synced_at)
      VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPlatform.run('plt_twitter', 'twitter', 'OmniTech Twitter/X', '@OmniTechCorp', 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=100', 142850, 642, 3820, 4.6, 940000, 2150000, now);
    insertPlatform.run('plt_linkedin', 'linkedin', 'OmniTech Corporation', 'company/omnitech-inc', 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=100', 89400, 120, 1240, 6.2, 580000, 1350000, now);
    insertPlatform.run('plt_instagram', 'instagram', 'OmniTech Global', '@omnitech_global', 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=100', 218300, 340, 2190, 5.8, 1420000, 3890000, now);
    insertPlatform.run('plt_facebook', 'facebook', 'OmniTech Official Page', 'facebook.com/OmniTechHQ', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100', 178900, 85, 4120, 3.4, 1120000, 2650000, now);
    insertPlatform.run('plt_youtube', 'youtube', 'OmniTech Tech & Cloud', '@OmniTechChannel', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100', 94800, 45, 340, 8.1, 820000, 1980000, now);

    // 90 days historical metric records
    const insertHistory = this.db.prepare(`
      INSERT INTO metrics_history (platform, date, followers, impressions, reach, engagement_rate, clicks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const baseFollowers: Record<string, number> = {
      twitter: 125000,
      linkedin: 78000,
      instagram: 188000,
      facebook: 165000,
      youtube: 82000
    };

    const today = new Date();
    const insertManyHistory = this.db.transaction(() => {
      for (let i = 89; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const progress = (90 - i) / 90;

        for (const plt of ['twitter', 'linkedin', 'instagram', 'facebook', 'youtube']) {
          const growthFactor = 1 + progress * (plt === 'instagram' ? 0.16 : plt === 'linkedin' ? 0.14 : 0.1);
          const dayNoise = (Math.sin(i * 0.4) + Math.cos(i * 0.7)) * 120 + (Math.random() * 80);
          const followers = Math.round(baseFollowers[plt] * growthFactor + dayNoise);

          const impressions = Math.round(followers * (0.15 + Math.random() * 0.08) * 10);
          const reach = Math.round(impressions * 0.65);
          const engagementRate = Number((3.5 + Math.sin(i * 0.2) * 1.5 + Math.random() * 0.8).toFixed(2));
          const clicks = Math.round(impressions * (0.02 + Math.random() * 0.015));

          insertHistory.run(plt, dateStr, followers, impressions, reach, engagementRate, clicks);
        }
      }
    });
    insertManyHistory();

    // Sample posts
    const insertPost = this.db.prepare(`
      INSERT INTO posts (id, platforms_json, content, media_url, status, scheduled_at, published_at, created_at, author_id, author_name, metrics_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPost.run(
      'post_1',
      JSON.stringify(['twitter', 'linkedin']),
      '🚀 Excited to announce our Q3 Enterprise Cloud benchmark report! OmniTech delivers 40% lower latency across hybrid environments. Download the full whitepaper now: https://omnitech.io/whitepaper #CloudComputing #TechInnovation',
      null,
      'published',
      null,
      new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      'usr_manager',
      'Marcus Vance',
      JSON.stringify({ likes: 842, comments: 94, shares: 215, impressions: 24800, clicks: 1420 })
    );

    insertPost.run(
      'post_2',
      JSON.stringify(['instagram', 'facebook']),
      'Behind the scenes at our Annual Engineering Hackathon 💻 Over 50 teams building the future of AI-driven analytics. Swipe to see the winning projects! ✨ #TeamOmni #EngineeringExcellence #LifeAtOmni',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      'published',
      null,
      new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      'usr_admin',
      'Sarah Jenkins',
      JSON.stringify({ likes: 2140, comments: 188, shares: 340, impressions: 48900, clicks: 890 })
    );

    insertPost.run(
      'post_3',
      JSON.stringify(['youtube']),
      'Full Deep Dive: Architecting Real-Time Streaming Pipelines with Node.js, WebSockets and Kafka. Watch now on our official channel! 🎬',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      'published',
      null,
      new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
      'usr_manager',
      'Marcus Vance',
      JSON.stringify({ likes: 3400, comments: 420, shares: 780, impressions: 72000, clicks: 3890 })
    );

    insertPost.run(
      'post_4',
      JSON.stringify(['twitter', 'linkedin', 'facebook']),
      'Join our upcoming live webinar with Industry Leaders: "Navigating AI Governance & Compliance in 2026". Free registration is now open! 🎟️',
      null,
      'scheduled',
      new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      null,
      new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      'usr_manager',
      'Marcus Vance',
      null
    );

    insertPost.run(
      'post_5',
      JSON.stringify(['instagram']),
      'Customer Spotlight: How FinTech Pioneer NeoBank scaled their transactions 10x with zero downtime. Link in bio for the case study! 🌟',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
      'scheduled',
      new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      null,
      now,
      'usr_admin',
      'Sarah Jenkins',
      null
    );

    insertPost.run(
      'post_6',
      JSON.stringify(['twitter']),
      'Tip of the Day: Optimize your microservices with distributed tracing. What tools does your DevOps team swear by? 🛠️',
      null,
      'draft',
      null,
      null,
      now,
      'usr_manager',
      'Marcus Vance',
      null
    );

    // Sentiment logs
    const insertSentiment = this.db.prepare(`
      INSERT INTO sentiment_logs (id, platform, sentiment, score, text, author, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertSentiment.run('snt_1', 'twitter', 'positive', 0.94, 'The new dashboard release from @OmniTechCorp is blazingly fast! Saved our team 10+ hours this week alone.', '@alex_devops', new Date(Date.now() - 15 * 60 * 1000).toISOString());
    insertSentiment.run('snt_2', 'linkedin', 'positive', 0.88, 'Outstanding benchmark report published by OmniTech. Really insightful breakdown of hybrid cloud economics.', 'David Chen, VP Infrastructure', new Date(Date.now() - 45 * 60 * 1000).toISOString());
    insertSentiment.run('snt_3', 'twitter', 'neutral', 0.52, 'Checking out @OmniTechCorp analytics tools. Anyone have experience comparing with Datadog?', '@cloud_ninja', new Date(Date.now() - 90 * 60 * 1000).toISOString());
    insertSentiment.run('snt_4', 'instagram', 'positive', 0.91, 'Love seeing behind the scenes photos of your engineering team culture! Keep it up.', 'sarah.codes', new Date(Date.now() - 140 * 60 * 1000).toISOString());
    insertSentiment.run('snt_5', 'facebook', 'negative', 0.22, 'Had a quick question on billing yesterday and took 3 hours to get an agent reply.', 'Robert Taylor', new Date(Date.now() - 210 * 60 * 1000).toISOString());

    // Demographics
    const demographics: AudienceDemographics = {
      ageGroups: [
        { age: '18-24', percentage: 14 },
        { age: '25-34', percentage: 46 },
        { age: '35-44', percentage: 24 },
        { age: '45-54', percentage: 11 },
        { age: '55+', percentage: 5 }
      ],
      genderSplit: [
        { gender: 'Male', percentage: 58 },
        { gender: 'Female', percentage: 39 },
        { gender: 'Non-binary / Other', percentage: 3 }
      ],
      topCountries: [
        { country: 'United States', percentage: 38 },
        { country: 'United Kingdom', percentage: 14 },
        { country: 'Germany', percentage: 11 },
        { country: 'India', percentage: 16 },
        { country: 'Canada', percentage: 8 },
        { country: 'Others', percentage: 13 }
      ]
    };

    this.db.prepare('INSERT OR REPLACE INTO system_metadata (key, data_json) VALUES (?, ?)').run('demographics', JSON.stringify(demographics));

    // Audit logs
    const insertAudit = this.db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, action, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run('aud_1', 'usr_admin', 'Sarah Jenkins', 'PLATFORM_SYNC', 'Manual resync completed for Twitter/X and LinkedIn', new Date(Date.now() - 3600 * 1000).toISOString());
    insertAudit.run('aud_2', 'usr_manager', 'Marcus Vance', 'POST_SCHEDULED', 'Scheduled post #post_4 for Twitter, LinkedIn, Facebook', new Date(Date.now() - 2 * 3600 * 1000).toISOString());
  }

  // Users
  public getUsers(): User[] {
    const rows = this.db.prepare('SELECT id, name, email, password_hash as passwordHash, role, avatar, created_at as createdAt FROM users').all();
    return rows as User[];
  }

  public getUserById(id: string): User | undefined {
    return this.db.prepare('SELECT id, name, email, password_hash as passwordHash, role, avatar, created_at as createdAt FROM users WHERE id = ?').get(id) as User | undefined;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.db.prepare('SELECT id, name, email, password_hash as passwordHash, role, avatar, created_at as createdAt FROM users WHERE lower(email) = lower(?)').get(email) as User | undefined;
  }

  public createUser(user: User): User {
    this.db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, user.name, user.email, user.passwordHash, user.role, user.avatar, user.createdAt);
    return user;
  }

  public updateUserRole(userId: string, role: 'admin' | 'manager' | 'viewer'): User | null {
    this.db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
    return this.getUserById(userId) || null;
  }

  public deleteUser(userId: string): boolean {
    const res = this.db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return res.changes > 0;
  }

  // Platforms
  public getPlatforms(): PlatformAccount[] {
    const rows = this.db.prepare(`
      SELECT id, platform, name, handle, avatar,
             is_connected as isConnected, is_simulated as isSimulated,
             api_key as apiKey, api_secret as apiSecret, access_token as accessToken,
             followers_count as followersCount, following_count as followingCount,
             posts_count as postsCount, engagement_rate as engagementRate,
             reach_30d as reach30d, impressions_30d as impressions30d,
             last_synced_at as lastSyncedAt
      FROM platforms
    `).all();

    return rows.map((r: any) => ({
      ...r,
      isConnected: Boolean(r.isConnected),
      isSimulated: Boolean(r.isSimulated)
    })) as PlatformAccount[];
  }

  public getPlatform(platform: string): PlatformAccount | undefined {
    const r: any = this.db.prepare(`
      SELECT id, platform, name, handle, avatar,
             is_connected as isConnected, is_simulated as isSimulated,
             api_key as apiKey, api_secret as apiSecret, access_token as accessToken,
             followers_count as followersCount, following_count as followingCount,
             posts_count as postsCount, engagement_rate as engagementRate,
             reach_30d as reach30d, impressions_30d as impressions30d,
             last_synced_at as lastSyncedAt
      FROM platforms WHERE platform = ?
    `).get(platform);

    if (!r) return undefined;
    return {
      ...r,
      isConnected: Boolean(r.isConnected),
      isSimulated: Boolean(r.isSimulated)
    } as PlatformAccount;
  }

  public updatePlatform(platform: string, updates: Partial<PlatformAccount>): PlatformAccount | null {
    const existing = this.getPlatform(platform);
    if (!existing) return null;

    const merged = { ...existing, ...updates, lastSyncedAt: new Date().toISOString() };

    this.db.prepare(`
      UPDATE platforms SET
        name = ?, handle = ?, avatar = ?,
        is_connected = ?, is_simulated = ?,
        api_key = ?, api_secret = ?, access_token = ?,
        followers_count = ?, following_count = ?, posts_count = ?,
        engagement_rate = ?, reach_30d = ?, impressions_30d = ?,
        last_synced_at = ?
      WHERE platform = ?
    `).run(
      merged.name,
      merged.handle,
      merged.avatar,
      merged.isConnected ? 1 : 0,
      merged.isSimulated ? 1 : 0,
      merged.apiKey || null,
      merged.apiSecret || null,
      merged.accessToken || null,
      merged.followersCount,
      merged.followingCount,
      merged.postsCount,
      merged.engagementRate,
      merged.reach30d,
      merged.impressions30d,
      merged.lastSyncedAt,
      platform
    );

    return merged;
  }

  // Metrics History
  public getMetricsHistory(platform?: string, days = 30): PlatformMetricHistory[] | Record<string, PlatformMetricHistory[]> {
    if (platform) {
      const rows = this.db.prepare(`
        SELECT date, followers, impressions, reach, engagement_rate as engagementRate, clicks
        FROM metrics_history
        WHERE platform = ?
        ORDER BY date DESC
        LIMIT ?
      `).all(platform, days) as PlatformMetricHistory[];
      return rows.reverse();
    }

    const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'youtube'];
    const result: Record<string, PlatformMetricHistory[]> = {};

    for (const plt of platforms) {
      const rows = this.db.prepare(`
        SELECT date, followers, impressions, reach, engagement_rate as engagementRate, clicks
        FROM metrics_history
        WHERE platform = ?
        ORDER BY date DESC
        LIMIT ?
      `).all(plt, days) as PlatformMetricHistory[];
      result[plt] = rows.reverse();
    }

    return result;
  }

  // Posts
  public getPosts(): Post[] {
    const rows = this.db.prepare('SELECT * FROM posts ORDER BY datetime(created_at) DESC').all();
    return rows.map((r: any) => ({
      id: r.id,
      platforms: JSON.parse(r.platforms_json),
      content: r.content,
      mediaUrl: r.media_url || undefined,
      status: r.status,
      scheduledAt: r.scheduled_at || undefined,
      publishedAt: r.published_at || undefined,
      createdAt: r.created_at,
      authorId: r.author_id,
      authorName: r.author_name,
      metrics: r.metrics_json ? JSON.parse(r.metrics_json) : undefined
    }));
  }

  public getPostById(id: string): Post | undefined {
    const r: any = this.db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!r) return undefined;
    return {
      id: r.id,
      platforms: JSON.parse(r.platforms_json),
      content: r.content,
      mediaUrl: r.media_url || undefined,
      status: r.status,
      scheduledAt: r.scheduled_at || undefined,
      publishedAt: r.published_at || undefined,
      createdAt: r.created_at,
      authorId: r.author_id,
      authorName: r.author_name,
      metrics: r.metrics_json ? JSON.parse(r.metrics_json) : undefined
    };
  }

  public createPost(post: Post): Post {
    this.db.prepare(`
      INSERT INTO posts (id, platforms_json, content, media_url, status, scheduled_at, published_at, created_at, author_id, author_name, metrics_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      post.id,
      JSON.stringify(post.platforms),
      post.content,
      post.mediaUrl || null,
      post.status,
      post.scheduledAt || null,
      post.publishedAt || null,
      post.createdAt,
      post.authorId,
      post.authorName,
      post.metrics ? JSON.stringify(post.metrics) : null
    );
    return post;
  }

  public updatePost(id: string, updates: Partial<Post>): Post | null {
    const existing = this.getPostById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates };

    this.db.prepare(`
      UPDATE posts SET
        platforms_json = ?,
        content = ?,
        media_url = ?,
        status = ?,
        scheduled_at = ?,
        published_at = ?,
        metrics_json = ?
      WHERE id = ?
    `).run(
      JSON.stringify(merged.platforms),
      merged.content,
      merged.mediaUrl || null,
      merged.status,
      merged.scheduledAt || null,
      merged.publishedAt || null,
      merged.metrics ? JSON.stringify(merged.metrics) : null,
      id
    );

    return merged;
  }

  public deletePost(id: string): boolean {
    const res = this.db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    return res.changes > 0;
  }

  // Sentiment
  public getSentimentLogs(): SentimentLog[] {
    const rows = this.db.prepare('SELECT id, platform, sentiment, score, text, author, timestamp FROM sentiment_logs ORDER BY datetime(timestamp) DESC LIMIT 100').all();
    return rows as SentimentLog[];
  }

  public addSentimentLog(log: SentimentLog): SentimentLog {
    this.db.prepare(`
      INSERT INTO sentiment_logs (id, platform, sentiment, score, text, author, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(log.id, log.platform, log.sentiment, log.score, log.text, log.author, log.timestamp);
    return log;
  }

  // Demographics
  public getDemographics(): AudienceDemographics {
    const r: any = this.db.prepare('SELECT data_json FROM system_metadata WHERE key = ?').get('demographics');
    if (!r) {
      return { ageGroups: [], genderSplit: [], topCountries: [] };
    }
    return JSON.parse(r.data_json);
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    const rows = this.db.prepare('SELECT id, user_id as userId, user_name as userName, action, details, timestamp FROM audit_logs ORDER BY datetime(timestamp) DESC LIMIT 100').all();
    return rows as AuditLog[];
  }

  public addAuditLog(log: AuditLog): void {
    this.db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, action, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(log.id, log.userId, log.userName, log.action, log.details, log.timestamp);
  }
}

export const db = new SQLiteDatabase();
