import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useWebSocket } from '../../context/WebSocketContext.js';
import {
  Bell,
  Radio,
  LogOut,
  Shield,
  Briefcase,
  Eye,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const { isConnected, events, clearEvents } = useWebSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <Briefcase className="w-3 h-3" /> Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Eye className="w-3 h-3" /> Viewer
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-xl shadow-md">
            Ω
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              OmniSocial
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise Social Intelligence</p>
          </div>
        </div>

        {/* Real-Time Live Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <Radio className="w-3.5 h-3.5" />
          <span>{isConnected ? 'Real-Time Feed Active' : 'Connecting to Stream...'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Quick Switcher Demo Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Switch demo role to test RBAC permissions"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Demo Role:</span>
            {getRoleBadge(user?.role)}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Switch Role to Test RBAC
              </div>
              <button
                onClick={() => {
                  demoLogin('admin');
                  setShowRoleSwitcher(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg text-left transition ${
                  user?.role === 'admin'
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <div className="flex-1">
                  <div>Admin</div>
                  <div className="text-[10px] text-slate-400 font-normal">Full control + Team & APIs</div>
                </div>
              </button>

              <button
                onClick={() => {
                  demoLogin('manager');
                  setShowRoleSwitcher(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg text-left transition ${
                  user?.role === 'manager'
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                <div className="flex-1">
                  <div>Manager</div>
                  <div className="text-[10px] text-slate-400 font-normal">Create posts & view metrics</div>
                </div>
              </button>

              <button
                onClick={() => {
                  demoLogin('viewer');
                  setShowRoleSwitcher(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg text-left transition ${
                  user?.role === 'viewer'
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                <div className="flex-1">
                  <div>Viewer / Analyst</div>
                  <div className="text-[10px] text-slate-400 font-normal">Read-only dashboard</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Live Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {events.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {events.length > 9 ? '9+' : events.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">Live Stream Activity</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                    {events.length}
                  </span>
                </div>
                {events.length > 0 && (
                  <button
                    onClick={clearEvents}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                {events.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No live events yet. Waiting for stream...
                  </div>
                ) : (
                  events.slice(0, 10).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
                    >
                      <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {evt.user}{' '}
                          <span className="font-normal text-slate-500 dark:text-slate-400">
                            {evt.message}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="uppercase font-bold tracking-wider text-sky-600 dark:text-sky-400">
                            {evt.platform}
                          </span>
                          <span>•</span>
                          <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
          />
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user?.name}</div>
            <div className="text-slate-400 text-[11px]">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
