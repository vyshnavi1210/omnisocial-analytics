import React from 'react';
import { Post, PlatformType } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  MousePointer,
  Trash2,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onPublishNow?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPublishNow, onDelete }) => {
  const { canCreatePost } = useAuth();

  const platformBadge = (plt: PlatformType) => {
    const config: Record<PlatformType, { label: string; bg: string }> = {
      twitter: { label: 'Twitter / X', bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
      facebook: { label: 'Facebook', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
      instagram: { label: 'Instagram', bg: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300' },
      linkedin: { label: 'LinkedIn', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
      youtube: { label: 'YouTube', bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' }
    };
    const c = config[plt] || { label: plt, bg: 'bg-slate-100 text-slate-800' };
    return (
      <span key={plt} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  const getStatusBadge = () => {
    switch (post.status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Published
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <FileText className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {post.platforms.map((plt) => platformBadge(plt))}
          </div>
          {getStatusBadge()}
        </div>

        <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line line-clamp-4 leading-relaxed mb-3">
          {post.content}
        </p>

        {post.mediaUrl && (
          <div className="mb-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-48 bg-slate-50 dark:bg-slate-800">
            <img
              src={post.mediaUrl}
              alt="Media"
              className="w-full h-40 object-cover"
              onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
            />
          </div>
        )}
      </div>

      <div>
        {/* Post Metrics for Published Posts */}
        {post.status === 'published' && post.metrics && (
          <div className="flex items-center justify-between py-2 px-3 my-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1" title="Likes">
              <Heart className="w-3 h-3 text-rose-500" />
              <span>{post.metrics.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1" title="Comments">
              <MessageCircle className="w-3 h-3 text-sky-500" />
              <span>{post.metrics.comments.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1" title="Shares">
              <Share2 className="w-3 h-3 text-emerald-500" />
              <span>{post.metrics.shares.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1" title="Impressions">
              <Eye className="w-3 h-3 text-indigo-500" />
              <span>{post.metrics.impressions.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1" title="Link Clicks">
              <MousePointer className="w-3 h-3 text-amber-500" />
              <span>{post.metrics.clicks.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Footer info & action buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            <span>By {post.authorName}</span>
            {post.scheduledAt && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{new Date(post.scheduledAt).toLocaleString()}</span>
              </div>
            )}
            {post.publishedAt && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                {new Date(post.publishedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {canCreatePost && (
            <div className="flex items-center gap-1.5">
              {post.status !== 'published' && onPublishNow && (
                <button
                  onClick={() => onPublishNow(post.id)}
                  className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition"
                  title="Publish Immediately"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(post.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Delete Post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
