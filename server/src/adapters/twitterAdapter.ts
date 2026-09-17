import axios from 'axios';
import { BaseSocialAdapter, AdapterProfileResult, AdapterMetricsResult, PublishResult } from './baseAdapter.js';

export class TwitterAdapter extends BaseSocialAdapter {
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (this.account.isSimulated || !this.account.accessToken) {
      return {
        success: true,
        message: 'Connected via Live Simulation Engine (X / Twitter API v2 mock)'
      };
    }

    try {
      const resp = await axios.get('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${this.account.accessToken}` },
        timeout: 5000
      });
      return {
        success: true,
        message: `Successfully authenticated with Twitter/X API v2 for @${resp.data.data?.username}`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Twitter API error: ${err.response?.data?.title || err.message}`
      };
    }
  }

  async fetchProfile(): Promise<AdapterProfileResult> {
    if (!this.account.isSimulated && this.account.accessToken) {
      try {
        const resp = await axios.get('https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url', {
          headers: { Authorization: `Bearer ${this.account.accessToken}` },
          timeout: 5000
        });
        const user = resp.data.data;
        return {
          handle: `@${user.username}`,
          name: user.name,
          followersCount: user.public_metrics?.followers_count || this.account.followersCount,
          followingCount: user.public_metrics?.following_count || this.account.followingCount,
          postsCount: user.public_metrics?.tweet_count || this.account.postsCount,
          avatar: user.profile_image_url || this.account.avatar
        };
      } catch (err) {
        console.warn('Falling back to cached profile for Twitter:', err);
      }
    }

    // Realistic dynamic variation
    const delta = Math.floor((Math.random() - 0.45) * 15);
    return {
      handle: this.account.handle,
      name: this.account.name,
      followersCount: Math.max(1000, this.account.followersCount + delta),
      followingCount: this.account.followingCount,
      postsCount: this.account.postsCount,
      avatar: this.account.avatar
    };
  }

  async fetchLatestMetrics(): Promise<AdapterMetricsResult> {
    const followers = this.account.followersCount;
    const impressions = Math.round(followers * (0.18 + Math.random() * 0.05) * 10);
    const reach = Math.round(impressions * 0.62);
    const engagementRate = Number((4.2 + (Math.random() * 0.8)).toFixed(2));
    const clicks = Math.round(impressions * 0.025);

    return {
      followers,
      impressions,
      reach,
      engagementRate,
      clicks
    };
  }

  async publishPost(content: string, mediaUrl?: string): Promise<PublishResult> {
    if (!this.account.isSimulated && this.account.accessToken) {
      try {
        const resp = await axios.post(
          'https://api.twitter.com/2/tweets',
          { text: content },
          {
            headers: {
              Authorization: `Bearer ${this.account.accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 8000
          }
        );
        return {
          success: true,
          postId: resp.data?.data?.id,
          platformResponse: resp.data
        };
      } catch (err: any) {
        console.error('Twitter live publish error:', err.response?.data || err.message);
        return {
          success: false,
          error: err.response?.data?.detail || err.message
        };
      }
    }

    // Simulated publish
    return {
      success: true,
      postId: `tw_${Date.now()}`,
      platformResponse: { simulated: true, timestamp: new Date().toISOString() }
    };
  }
}
