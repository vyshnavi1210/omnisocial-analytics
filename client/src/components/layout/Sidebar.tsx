import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Share2,
  Users,
  Settings,
  Sparkles,
  Lock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { canManageTeam, user } = useAuth();

  const navItems = [
    {
      label: 'Overview',
      path: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'viewer']
    },
    {
      label: 'Analytics & Reports',
      path: '/analytics',
      icon: BarChart3,
      roles: ['admin', 'manager', 'viewer']
    },
    {
      label: 'Content Scheduler',
      path: '/posts',
      icon: CalendarDays,
      roles: ['admin', 'manager', 'viewer']
    },
    {
      label: 'Platform APIs',
      path: '/platforms',
      icon: Share2,
      roles: ['admin', 'manager', 'viewer']
    },
    {
      label: 'Team & RBAC',
      path: '/team',
      icon: Users,
      roles: ['admin'],
      requiresAdmin: true
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: ['admin', 'manager', 'viewer']
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isLocked = item.requiresAdmin && !canManageTeam;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.requiresAdmin && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        canManageTeam
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                      title={canManageTeam ? 'Admin access' : 'Admin only (locked)'}
                    >
                      {isLocked ? <Lock className="w-2.5 h-2.5" /> : null}
                      ADMIN
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Connected Platforms Quick Summary */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Connected Channels
          </div>
          <div className="space-y-2 px-3 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                Twitter / X
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">142.8k</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Instagram
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">218.3k</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                LinkedIn
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">89.4k</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Facebook
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">178.9k</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                YouTube
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">94.8k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info card */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/20 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-300 mb-1">
          <Sparkles className="w-4 h-4 text-sky-500" />
          Real-Time Sync Engine
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
          Aggregating 5 social media APIs with dynamic WebSocket streaming.
        </p>
      </div>
    </aside>
  );
};
