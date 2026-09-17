import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api.js';
import {
  SentimentSummary,
  SentimentLog,
  AudienceDemographics,
  PlatformType
} from '../types/index.js';
import { PeakHoursHeatmap } from '../components/charts/PeakHoursHeatmap.js';
import { AudienceDemographicsChart } from '../components/charts/AudienceDemographicsChart.js';
import { SentimentRadarDonut } from '../components/charts/SentimentRadarDonut.js';
import {
  BarChart3,
  Download,
  Filter,
  Smile,
  Meh,
  Frown,
  Calendar,
  MessageSquare
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [sentimentSummary, setSentimentSummary] = useState<SentimentSummary | null>(null);
  const [sentimentLogs, setSentimentLogs] = useState<SentimentLog[]>([]);
  const [demographics, setDemographics] = useState<AudienceDemographics | null>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sData, dData, hData] = await Promise.all([
          analyticsApi.getSentiment(),
          analyticsApi.getDemographics(),
          analyticsApi.getPeakHours()
        ]);
        setSentimentSummary(sData.summary);
        setSentimentLogs(sData.logs);
        setDemographics(dData);
        setHeatmapData(hData.heatmap);
      } catch (err) {
        console.error('Failed to load deep analytics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const filteredLogs = sentimentLogs.filter((log) => {
    const matchPlatform = selectedPlatform === 'all' || log.platform === selectedPlatform;
    const matchSentiment = selectedSentimentFilter === 'all' || log.sentiment === selectedSentimentFilter;
    return matchPlatform && matchSentiment;
  });

  const getSentimentPill = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Smile className="w-3 h-3" /> Positive
          </span>
        );
      case 'neutral':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Meh className="w-3 h-3" /> Neutral
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <Frown className="w-3 h-3" /> Negative
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-600" />
            In-Depth Social Analytics & Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Granular demographic segmentation, temporal engagement patterns, and NLP sentiment logs
          </p>
        </div>

        <a
          href={analyticsApi.exportCsvUrl()}
          download
          className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Metrics Report (CSV)</span>
        </a>
      </div>

      {/* Platform Filter Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {['all', 'twitter', 'instagram', 'linkedin', 'facebook', 'youtube'].map((plt) => (
          <button
            key={plt}
            onClick={() => setSelectedPlatform(plt)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              selectedPlatform === plt
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {plt === 'all' ? 'All Channels' : plt}
          </button>
        ))}
      </div>

      {/* Peak Hours Heatmap */}
      <PeakHoursHeatmap data={heatmapData} />

      {/* Demographics & Sentiment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {demographics && <AudienceDemographicsChart demographics={demographics} />}
        </div>
        <div>
          {sentimentSummary && <SentimentRadarDonut summary={sentimentSummary} />}
        </div>
      </div>

      {/* Sentiment NLP Logs Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              Real-Time Brand Mentions & Sentiment Stream
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filtered comment feed evaluated with sentiment scoring models
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSelectedSentimentFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedSentimentFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSentimentFilter('positive')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedSentimentFilter === 'positive'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setSelectedSentimentFilter('neutral')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedSentimentFilter === 'neutral'
                  ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Neutral
            </button>
            <button
              onClick={() => setSelectedSentimentFilter('negative')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedSentimentFilter === 'negative'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Negative
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="pb-3 px-3">Platform</th>
                <th className="pb-3 px-3">Author</th>
                <th className="pb-3 px-3">Comment Content</th>
                <th className="pb-3 px-3">Sentiment</th>
                <th className="pb-3 px-3 text-right">Confidence</th>
                <th className="pb-3 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 capitalize font-semibold text-slate-800 dark:text-slate-200">
                    {log.platform}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-400">
                    {log.author}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-md">
                    "{log.text}"
                  </td>
                  <td className="py-3 px-3">{getSentimentPill(log.sentiment)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                    {(log.score * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
