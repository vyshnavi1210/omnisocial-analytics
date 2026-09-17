import React, { useState, useEffect } from 'react';
import { postsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Post, PostStatus, PlatformType } from '../types/index.js';
import { PostCard } from '../components/posts/PostCard.js';
import { PostComposerModal } from '../components/posts/PostComposerModal.js';
import {
  CalendarDays,
  PlusCircle,
  Clock,
  CheckCircle2,
  FileText,
  Filter,
  AlertCircle
} from 'lucide-react';

export const ContentSchedulerPage: React.FC = () => {
  const { canCreatePost, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await postsApi.getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setNotification('Post queued or published successfully!');
    setTimeout(() => setNotification(''), 4000);
  };

  const handlePublishNow = async (id: string) => {
    try {
      const res = await postsApi.publishNow(id);
      setPosts((prev) => prev.map((p) => (p.id === id ? res.post : p)));
      setNotification('Post published immediately to selected channels!');
      setTimeout(() => setNotification(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to publish post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsApi.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setNotification('Post deleted successfully.');
      setTimeout(() => setNotification(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchPlatform = platformFilter === 'all' || p.platforms.includes(platformFilter as PlatformType);
    return matchStatus && matchPlatform;
  });

  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-sky-600" />
            Social Content Calendar & Scheduler
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compose, schedule, and orchestrate omnichannel social campaigns
          </p>
        </div>

        {canCreatePost ? (
          <button
            onClick={() => setIsComposerOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Compose New Post</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Viewer Role: Read-only access</span>
          </div>
        )}
      </div>

      {notification && (
        <div className="p-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Pipeline Status Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setStatusFilter('scheduled')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'scheduled'
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Scheduled Queue
            </span>
            <span className="text-lg font-black text-slate-800 dark:text-white">{scheduledCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for automated broadcast</p>
        </div>

        <div
          onClick={() => setStatusFilter('published')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'published'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Published History
            </span>
            <span className="text-lg font-black text-slate-800 dark:text-white">{publishedCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Live posts actively gathering stats</p>
        </div>

        <div
          onClick={() => setStatusFilter('draft')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'draft'
              ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Drafts & In-Review
            </span>
            <span className="text-lg font-black text-slate-800 dark:text-white">{draftCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Staged ideas pending approval</p>
        </div>
      </div>

      {/* Filter and Switcher Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1 rounded-lg transition ${
              statusFilter === 'scheduled'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Scheduled ({scheduledCount})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1 rounded-lg transition ${
              statusFilter === 'published'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1 rounded-lg transition ${
              statusFilter === 'draft'
                ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Channel:
          </span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Channels</option>
            <option value="twitter">Twitter / X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="h-60 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No posts found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no posts matching the selected filters. Click "Compose New Post" above to stage your next campaign!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPublishNow={handlePublishNow}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};
