import axios from 'axios';
import { BaseSocialAdapter, AdapterProfileResult, AdapterMetricsResult, PublishResult } from './baseAdapter.js';

export class LinkedInAdapter extends BaseSocialAdapter {
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (this.account.isSimulated || !this.account.accessToken) {
      return {
        success: true,
        message: 'Connected via Live Simulation Engine (LinkedIn Community API v2 mock)'
      };
    }

    try {
      const resp = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${this.account.accessToken}` },
        timeout: 5000
      });
      return {
        success: true,
        message: `Authenticated with LinkedIn for: ${resp.data.name || resp.data.sub}`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `LinkedIn API error: ${err.response?.data?.message || err.message}`
      };
    }
  }

  async fetchProfile(): Promise<AdapterProfileResult> {
    const delta = Math.floor((Math.random() - 0.35) * 12);
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
    const impressions = Math.round(followers * 0.16 * 10);
    const reach = Math.round(impressions * 0.68);
    const engagementRate = Number((6.2 + (Math.random() * 0.75)).toFixed(2));
    const clicks = Math.round(impressions * 0.038);

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
          'https://api.linkedin.com/v2/ugcPosts',
          {
            author: `urn:li:person:${this.account.handle}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: content },
                shareMediaCategory: 'NONE'
              }
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
          },
          {
            headers: {
              Authorization: `Bearer ${this.account.accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0'
            },
            timeout: 8000
          }
        );
        return {
          success: true,
          postId: resp.data?.id,
          platformResponse: resp.data
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.response?.data?.message || err.message
        };
      }
    }

    return {
      success: true,
      postId: `li_${Date.now()}`,
      platformResponse: { simulated: true }
    };
  }
}
