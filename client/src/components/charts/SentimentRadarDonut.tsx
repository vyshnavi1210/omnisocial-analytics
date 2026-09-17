import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { SentimentSummary } from '../../types/index.js';
import { Smile, Meh, Frown, TrendingUp } from 'lucide-react';

interface SentimentRadarDonutProps {
  summary: SentimentSummary;
}

export const SentimentRadarDonut: React.FC<SentimentRadarDonutProps> = ({ summary }) => {
  const data = [
    { name: 'Positive', value: summary.positivePercent, color: '#10b981' },
    { name: 'Neutral', value: summary.neutralPercent, color: '#94a3b8' },
    { name: 'Negative', value: summary.negativePercent, color: '#f43f5e' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
            {item.name}: {item.value}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Audience Sentiment</h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <TrendingUp className="w-3 h-3" /> NSS +{summary.netSentimentScore}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          NLP analysis across brand mentions, comments, and direct replies
        </p>
      </div>

      <div className="relative h-48 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.positivePercent}%</span>
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Positive</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
          <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">
            <Smile className="w-3.5 h-3.5" />
            <span>{summary.positivePercent}%</span>
          </div>
          <span className="text-[10px] text-slate-500">Positive</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60">
          <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
            <Meh className="w-3.5 h-3.5" />
            <span>{summary.neutralPercent}%</span>
          </div>
          <span className="text-[10px] text-slate-500">Neutral</span>
        </div>

        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30">
          <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 font-semibold mb-0.5">
            <Frown className="w-3.5 h-3.5" />
            <span>{summary.negativePercent}%</span>
          </div>
          <span className="text-[10px] text-slate-500">Negative</span>
        </div>
      </div>
    </div>
  );
};
