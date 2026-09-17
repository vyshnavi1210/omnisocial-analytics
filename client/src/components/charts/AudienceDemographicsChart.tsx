import React from 'react';
import { AudienceDemographics } from '../../types/index.js';
import { Globe2, Users2 } from 'lucide-react';

interface AudienceDemographicsChartProps {
  demographics: AudienceDemographics;
}

export const AudienceDemographicsChart: React.FC<AudienceDemographicsChartProps> = ({ demographics }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-4 h-4 text-sky-600" />
            Audience Demographics & Geo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-channel audience distribution by age, gender, and country
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age Brackets */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Age Distribution
          </h4>
          <div className="space-y-2.5">
            {demographics.ageGroups.map((grp) => (
              <div key={grp.age}>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-600 dark:text-slate-300">{grp.age}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{grp.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${grp.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gender Split */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Gender Identification
            </h4>
            <div className="flex items-center gap-2 text-xs">
              {demographics.genderSplit.map((g) => (
                <div
                  key={g.gender}
                  className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center"
                >
                  <div className="text-slate-400 text-[10px]">{g.gender}</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {g.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            Top Geographic Markets
          </h4>
          <div className="space-y-2.5">
            {demographics.topCountries.map((c, idx) => (
              <div
                key={c.country}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.percentage * 2}%` }} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 w-8 text-right">
                    {c.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
