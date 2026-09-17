import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface FollowerGrowthChartProps {
  data: any[];
  days: number;
  onDaysChange: (days: number) => void;
  isLoading?: boolean;
}

export const FollowerGrowthChart: React.FC<FollowerGrowthChartProps> = ({
  data,
  days,
  onDaysChange,
  isLoading
}) => {
  const [metricMode, setMetricMode] = useState<'followers' | 'impressions' | 'reach'>('followers');

  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
          <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
            {label}
          </div>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 capitalize font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {entry.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Audience Growth & Reach Dynamics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-platform trajectory tracking with historical trend regression
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Metric Selector */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setMetricMode('followers')}
              className={`px-3 py-1 rounded-lg transition ${
                metricMode === 'followers'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => setMetricMode('impressions')}
              className={`px-3 py-1 rounded-lg transition ${
                metricMode === 'impressions'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Impressions
            </button>
            <button
              onClick={() => setMetricMode('reach')}
              className={`px-3 py-1 rounded-lg transition ${
                metricMode === 'reach'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Reach
            </button>
          </div>

          {/* Date range buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => onDaysChange(d)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  days === d
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTwitter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLinkedIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />

              {metricMode === 'followers' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="totalFollowers"
                    name="Total Network"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="instagram"
                    name="Instagram"
                    stroke="#ec4899"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorInstagram)"
                  />
                  <Area
                    type="monotone"
                    dataKey="twitter"
                    name="Twitter / X"
                    stroke="#0ea5e9"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorTwitter)"
                  />
                  <Area
                    type="monotone"
                    dataKey="linkedin"
                    name="LinkedIn"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorLinkedIn)"
                  />
                </>
              ) : metricMode === 'impressions' ? (
                <Area
                  type="monotone"
                  dataKey="totalImpressions"
                  name="Total Impressions"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={0.2}
                  fill="#8b5cf6"
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="totalReach"
                  name="Unique Reach"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={0.2}
                  fill="#10b981"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
