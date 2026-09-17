import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { PlatformAccount } from '../../types/index.js';

interface EngagementRateBarChartProps {
  platforms: PlatformAccount[];
}

export const EngagementRateBarChart: React.FC<EngagementRateBarChartProps> = ({ platforms }) => {
  const platformColors: Record<string, string> = {
    twitter: '#0ea5e9',
    instagram: '#ec4899',
    linkedin: '#2563eb',
    facebook: '#3b82f6',
    youtube: '#ef4444'
  };

  const chartData = platforms.map((p) => ({
    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    platform: p.platform,
    rate: p.engagementRate,
    benchmark: p.platform === 'youtube' ? 6.5 : p.platform === 'linkedin' ? 4.5 : p.platform === 'instagram' ? 4.0 : 2.5
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
          <div className="font-bold text-slate-900 dark:text-white capitalize">{data.name}</div>
          <div className="flex justify-between gap-4 text-sky-600 dark:text-sky-400 font-semibold">
            <span>Engagement Rate:</span>
            <span>{data.rate}%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-400">
            <span>Industry Baseline:</span>
            <span>{data.benchmark}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Engagement Rate Benchmark</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-platform interaction ratio (Likes + Comments + Shares / Impressions)
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.platform}`} fill={platformColors[entry.platform] || '#0284c7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
