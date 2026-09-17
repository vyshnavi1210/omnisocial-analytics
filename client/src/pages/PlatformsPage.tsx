import React, { useState, useEffect } from 'react';
import { platformsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { PlatformAccount, PlatformType } from '../types/index.js';
import { PlatformConfigModal } from '../components/platforms/PlatformConfigModal.js';
import {
  Share2,
  Sliders,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap,
  Radio,
  ExternalLink,
  Users,
  Eye,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export const PlatformsPage: React.FC = () => {
  const { canManageTeam } = useAuth();
  const [platforms, setPlatforms] = useState<PlatformAccount[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformAccount | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadPlatforms = async () => {
    try {
      const data = await platformsApi.getPlatforms();
      setPlatforms(data);
    } catch (err) {
      console.error('Failed to load platforms', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  const handleTest = async (plt: string) => {
    setLoadingActions((prev) => ({ ...prev, [`test_${plt}`]: true }));
    try {
      const res = await platformsApi.testConnection(plt);
      setTestResults((prev) => ({ ...prev, [plt]: { success: res.success, message: res.message } }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [plt]: { success: false, message: err.response?.data?.error || 'Test failed.' }
      }));
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`test_${plt}`]: false }));
    }
  };

  const handleSync = async (plt: string) => {
    setLoadingActions((prev) => ({ ...prev, [`sync_${plt}`]: true }));
    try {
      const res = await platformsApi.syncPlatform(plt);
      setPlatforms((prev) => prev.map((p) => (p.platform === plt ? res.platform : p)));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to sync platform');
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`sync_${plt}`]: false }));
    }
  };

  const handlePlatformUpdated = (updated: PlatformAccount) => {
    setPlatforms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const getPlatformIconColor = (plt: PlatformType) => {
    switch (plt) {
      case 'twitter':
        return 'bg-sky-500 text-white';
      case 'instagram':
        return 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white';
      case 'linkedin':
        return 'bg-blue-600 text-white';
      case 'facebook':
        return 'bg-blue-500 text-white';
      case 'youtube':
        return 'bg-red-600 text-white';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-sky-600" />
            Social Media API Connectors & Webhooks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise API token management, live polling adapters, and simulation engines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>5 Connectors Active</span>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500 text-white flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">
              Dual-Engine Architecture: Simulated Mock + Live Production API
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Each channel seamlessly operates either on high-fidelity dynamic simulations or live platform Bearer Tokens. Click "Configure" to enter API keys.
            </div>
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((p) => {
          const test = testResults[p.platform];
          const isTesting = loadingActions[`test_${p.platform}`];
          const isSyncing = loadingActions[`sync_${p.platform}`];

          return (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${getPlatformIconColor(
                        p.platform
                      )}`}
                    >
                      {p.platform.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</h3>
                      <p className="text-xs text-slate-400">{p.handle}</p>
                    </div>
                  </div>

                  {p.isSimulated ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Simulated
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                      <Radio className="w-3 h-3" /> Live API
                    </span>
                  )}
                </div>

                {/* Metrics Stats Summary */}
                <div className="grid grid-cols-3 gap-2 p-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Followers</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                      {p.followersCount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Eng. Rate</div>
                    <div className="text-xs font-black text-sky-600 dark:text-sky-400 mt-0.5">
                      {p.engagementRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Posts</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                      {p.postsCount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Test Result Message Box */}
                {test && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-[11px] flex items-start gap-1.5 ${
                      test.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {test.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{test.message}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>Last synced:</span>
                  <span>{new Date(p.lastSyncedAt).toLocaleTimeString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTest(p.platform)}
                    disabled={isTesting}
                    className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test API'}</span>
                  </button>

                  <button
                    onClick={() => handleSync(p.platform)}
                    disabled={isSyncing}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1 disabled:opacity-50"
                    title="Manual metrics sync"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>

                  {canManageTeam && (
                    <button
                      onClick={() => {
                        setSelectedPlatform(p);
                        setIsConfigOpen(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      title="Configure API Keys & Settings"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PlatformConfigModal
        platform={selectedPlatform}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onUpdated={handlePlatformUpdated}
      />
    </div>
  );
};
