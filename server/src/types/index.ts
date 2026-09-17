export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  lastLogin?: string;
}

export type PlatformType = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';

export interface PlatformAccount {
  id: string;
  platform: PlatformType;
  name: string;
  handle: string;
  avatar: string;
  isConnected: boolean;
  isSimulated: boolean;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number; // percentage (e.g. 4.2)
  reach30d: number;
  impressions30d: number;
  lastSyncedAt: string;
}

export type PostStatus = 'published' | 'scheduled' | 'draft';

export interface Post {
  id: string;
  platforms: PlatformType[];
  content: string;
  mediaUrl?: string;
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    clicks: number;
  };
}

export interface MetricDataPoint {
  date: string;
  twitter: number;
  facebook: number;
  instagram: number;
  linkedin: number;
  youtube: number;
  total: number;
}

export interface PlatformMetricHistory {
  date: string;
  followers: number;
  impressions: number;
  reach: number;
  engagementRate: number;
  clicks: number;
}

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface SentimentLog {
  id: string;
  platform: PlatformType;
  sentiment: SentimentType;
  score: number; // 0.0 to 1.0
  text: string;
  author: string;
  timestamp: string;
}

export interface AudienceDemographics {
  ageGroups: { age: string; percentage: number }[];
  genderSplit: { gender: string; percentage: number }[];
  topCountries: { country: string; percentage: number }[];
}

export interface LiveFeedEvent {
  id: string;
  platform: PlatformType;
  type: 'mention' | 'follow' | 'like' | 'comment' | 'milestone';
  message: string;
  user: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
