import React, { useState, useEffect } from 'react';
import { analyticsApi, postsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useWebSocket } from '../context/WebSocketContext.js';
import {
  PlatformAccount,
  Post,
  OverviewKPIs,
  SentimentSummary
} from '../types/index.js';
import { FollowerGrowthChart } from '../components/charts/FollowerGrowthChart.js';
import { EngagementRateBarChart } from '../components/charts/EngagementRateBarChart.js';
import { SentimentRadarDonut } from '../components/charts/SentimentRadarDonut.js';
import { PostComposerModal } from '../components/posts/PostComposerModal.js';
import { PostCard } from '../components/posts/PostCard.js';
import {
  Users,
  Eye,
  TrendingUp,
  Smile,
  PlusCircle,
  Download,
  Share2,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { canCreatePost } = useAuth();
  const { latestEvent, isConnected } = useWebSocket();

  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [platforms, setPlatforms] = useState<PlatformAccount[]>([]);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [chartDays, setChartDays] = useState<number>(30);
  const [sentimentSummary, setSentimentSummary] = useState<SentimentSummary | null>(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Fetch initial overview
  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [overviewData, sentimentData] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getSentiment()
        ]);
        setKpis(overviewData.kpis);
        setPlatforms(overviewData.platforms);
        setTopPosts(overviewData.topPosts);
        setSentimentSummary(sentimentData.summary);
      } catch (err) {
        console.error('Failed to load dashboard overview', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOverview();
  }, []);

  // Fetch chart data when days change
  useEffect(() => {
    const loadChart = async () => {
      setIsChartLoading(true);
      try {
        const res = await analyticsApi.getHistorical(chartDays);
        setChartSeries(res.series);
      } catch (err) {
        console.error('Failed to load chart data', err);
      } finally {
        setIsChartLoading(false);
      }
    };

    loadChart();
  }, [chartDays]);

  const handlePostCreated = (newPost: Post) => {
    setTopPosts((prev) => [newPost, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
          <p className="text-xs text-slate-500">Aggregating real-time social metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Enterprise Social Command Center
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-platform presence, engagement benchmarks, and content deployment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={analyticsApi.exportCsvUrl()}
            download
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          {canCreatePost && (
            <button
              onClick={() => setIsComposerOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Compose Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Live Ticker Banner */}
      {latestEvent && (
        <div className="p-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/20 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
            <span className="font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider text-[10px]">
              Live Stream Event ({latestEvent.platform})
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              <strong>{latestEvent.user}</strong> {latestEvent.message}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {new Date(latestEvent.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Followers */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Followers</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis?.totalFollowers.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              +{kpis?.growthRate30d}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 5 connected social channels</p>
        </div>

        {/* 30-Day Reach */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">30-Day Reach</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis ? (kpis.totalReach / 1000000).toFixed(2) : 0}M
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              +12.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Unique individuals reached</p>
        </div>

        {/* 30-Day Impressions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Impressions</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis ? (kpis.totalImpressions / 1000000).toFixed(2) : 0}M
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              +18.7%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total timeline & feed displays</p>
        </div>

        {/* Avg Engagement Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Engagement</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis?.avgEngagement}%
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              +0.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">2.1x higher than B2B industry average</p>
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <FollowerGrowthChart
        data={chartSeries}
        days={chartDays}
        onDaysChange={setChartDays}
        isLoading={isChartLoading}
      />

      {/* Secondary Visualizations: Benchmarks & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EngagementRateBarChart platforms={platforms} />
        </div>
        <div>
          {sentimentSummary && <SentimentRadarDonut summary={sentimentSummary} />}
        </div>
      </div>

      {/* Top Performing Content Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              High-Impact Social Campaigns
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top posts ranked by organic engagement, viral reshares, and link click-throughs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPosts.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};
