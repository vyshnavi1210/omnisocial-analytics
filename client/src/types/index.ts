export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt?: string;
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
  accessToken?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number;
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
  twitter?: number;
  facebook?: number;
  instagram?: number;
  linkedin?: number;
  youtube?: number;
  totalFollowers: number;
  totalImpressions: number;
  totalReach: number;
  [key: string]: any;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
  netSentimentScore: number;
}

export interface SentimentLog {
  id: string;
  platform: PlatformType;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
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

export interface OverviewKPIs {
  totalFollowers: number;
  totalReach: number;
  totalImpressions: number;
  avgEngagement: number;
  growthRate30d: number;
}
