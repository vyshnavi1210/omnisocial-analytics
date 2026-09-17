import { db } from '../db/database.js';
import { LiveFeedEvent, PlatformType } from '../types/index.js';

export class SimulatorService {
  private static instance: SimulatorService;
  private intervalId: NodeJS.Timeout | null = null;
  private eventListeners: ((event: LiveFeedEvent) => void)[] = [];

  public static getInstance(): SimulatorService {
    if (!SimulatorService.instance) {
      SimulatorService.instance = new SimulatorService();
    }
    return SimulatorService.instance;
  }

  public onEvent(callback: (event: LiveFeedEvent) => void): void {
    this.eventListeners.push(callback);
  }

  public start(): void {
    if (this.intervalId) return;

    // Trigger an event every 10 seconds
    this.intervalId = setInterval(() => {
      this.tick();
    }, 10000);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    const platforms: PlatformType[] = ['twitter', 'instagram', 'linkedin', 'facebook', 'youtube'];
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    const account = db.getPlatform(randomPlatform);

    if (account && account.isSimulated) {
      // Simulate organic follower growth (+1 to +5)
      const growth = Math.floor(Math.random() * 5) + 1;
      db.updatePlatform(randomPlatform, {
        followersCount: account.followersCount + growth
      });
    }

    // Check for scheduled posts that are due
    const now = new Date().toISOString();
    const posts = db.getPosts();
    posts.forEach(post => {
      if (post.status === 'scheduled' && post.scheduledAt && post.scheduledAt <= now) {
        db.updatePost(post.id, {
          status: 'published',
          publishedAt: now,
          metrics: {
            likes: Math.floor(Math.random() * 20) + 5,
            comments: Math.floor(Math.random() * 5) + 1,
            shares: Math.floor(Math.random() * 3),
            impressions: Math.floor(Math.random() * 400) + 100,
            clicks: Math.floor(Math.random() * 20) + 2
          }
        });

        const event: LiveFeedEvent = {
          id: `evt_pub_${Date.now()}`,
          platform: post.platforms[0] || 'twitter',
          type: 'milestone',
          message: `Scheduled post auto-published to ${post.platforms.join(', ')}: "${post.content.slice(0, 40)}..."`,
          user: 'OmniScheduler',
          timestamp: now
        };
        this.broadcast(event);
      }
    });

    // Generate a live engagement event
    const event = this.generateLiveEvent(randomPlatform);
    this.broadcast(event);
  }

  private generateLiveEvent(platform: PlatformType): LiveFeedEvent {
    const eventTypes: ('mention' | 'follow' | 'like' | 'comment' | 'milestone')[] = [
      'mention',
      'follow',
      'like',
      'comment'
    ];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const users = [
      '@tech_lead_alex',
      '@dev_jessica',
      '@cloud_architect_sam',
      '@sarah_ux',
      '@data_guru_mike',
      '@future_scale',
      '@ai_researcher_chen',
      '@frontend_wizard'
    ];
    const user = users[Math.floor(Math.random() * users.length)];

    let message = '';
    switch (type) {
      case 'follow':
        message = `started following your ${platform} profile`;
        break;
      case 'like':
        message = `liked your latest post on ${platform}`;
        break;
      case 'comment':
        message = `commented: "Incredible benchmark results, really excited for the rollout!"`;
        break;
      case 'mention':
        message = `tagged you in a thread discussing modern cloud performance`;
        break;
      default:
        message = `interacted with your ${platform} page`;
    }

    return {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      platform,
      type,
      message,
      user,
      timestamp: new Date().toISOString()
    };
  }

  private broadcast(event: LiveFeedEvent): void {
    this.eventListeners.forEach(fn => {
      try {
        fn(event);
      } catch (err) {
        console.error('Error delivering live event:', err);
      }
    });
  }
}

export const simulator = SimulatorService.getInstance();
