import { PlatformAccount, Post } from '../types/index.js';

export interface AdapterProfileResult {
  handle: string;
  name: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  avatar: string;
}

export interface AdapterMetricsResult {
  followers: number;
  impressions: number;
  reach: number;
  engagementRate: number;
  clicks: number;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  error?: string;
  platformResponse?: any;
}

export abstract class BaseSocialAdapter {
  protected account: PlatformAccount;

  constructor(account: PlatformAccount) {
    this.account = account;
  }

  abstract testConnection(): Promise<{ success: boolean; message: string }>;
  abstract fetchProfile(): Promise<AdapterProfileResult>;
  abstract fetchLatestMetrics(): Promise<AdapterMetricsResult>;
  abstract publishPost(content: string, mediaUrl?: string): Promise<PublishResult>;
}
