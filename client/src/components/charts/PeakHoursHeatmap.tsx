import React, { useState } from 'react';
import { Clock } from 'lucide-react';

interface HeatmapPoint {
  day: string;
  dayIndex: number;
  hour: number;
  intensity: number;
}

interface PeakHoursHeatmapProps {
  data: HeatmapPoint[];
}

export const PeakHoursHeatmap: React.FC<PeakHoursHeatmapProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapPoint | null>(null);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (intensity: number) => {
    if (intensity > 80) return 'bg-indigo-600 dark:bg-indigo-500 text-white';
    if (intensity > 60) return 'bg-indigo-400 dark:bg-indigo-600 text-white';
    if (intensity > 40) return 'bg-sky-300 dark:bg-sky-700 text-slate-800 dark:text-white';
    if (intensity > 20) return 'bg-sky-100 dark:bg-sky-950 text-slate-600 dark:text-slate-300';
    return 'bg-slate-100 dark:bg-slate-800/60 text-slate-400';
  };

  const getPoint = (dayIndex: number, hour: number) => {
    return data.find((d) => d.dayIndex === dayIndex && d.hour === hour) || {
      day: days[dayIndex],
      dayIndex,
      hour,
      intensity: 0
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            Peak Engagement Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Optimal times to post based on audience click-through & engagement density
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Low</span>
          <div className="flex gap-1">
            <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800"></span>
            <span className="w-3 h-3 rounded bg-sky-100 dark:bg-sky-950"></span>
            <span className="w-3 h-3 rounded bg-sky-300 dark:bg-sky-700"></span>
            <span className="w-3 h-3 rounded bg-indigo-400 dark:bg-indigo-600"></span>
            <span className="w-3 h-3 rounded bg-indigo-600 dark:bg-indigo-500"></span>
          </div>
          <span className="text-slate-400">Peak</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          {/* Hour labels */}
          <div className="grid grid-cols-[50px_repeat(24,1fr)] gap-1 mb-1 text-[10px] text-slate-400 font-semibold text-center">
            <div></div>
            {hours.map((h) => (
              <div key={h}>{h % 3 === 0 ? `${h}:00` : ''}</div>
            ))}
          </div>

          {/* Day rows */}
          <div className="space-y-1">
            {days.map((dayName, dayIndex) => (
              <div key={dayName} className="grid grid-cols-[50px_repeat(24,1fr)] gap-1 items-center">
                <span className="text-[11px] font-semibold text-slate-500">{dayName}</span>
                {hours.map((hour) => {
                  const pt = getPoint(dayIndex, hour);
                  return (
                    <div
                      key={hour}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className={`h-6 rounded-md cursor-pointer transition-transform hover:scale-125 ${getColor(
                        pt.intensity
                      )}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Info & Recommended Slot */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        <div>
          {hoveredPoint ? (
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {hoveredPoint.day} at {hoveredPoint.hour}:00 —{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {hoveredPoint.intensity}% engagement density
              </span>
            </span>
          ) : (
            <span className="text-slate-400">Hover over any grid cell to inspect hourly engagement</span>
          )}
        </div>

        <div className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium text-xs">
          ⭐ Best Window: <strong>Tue & Thu 10:00 AM – 1:00 PM</strong>
        </div>
      </div>
    </div>
  );
};
