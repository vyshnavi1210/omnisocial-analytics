import React, { useState } from 'react';
import { postsApi } from '../../services/api.js';
import { Post, PlatformType } from '../../types/index.js';
import {
  X,
  Send,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
  onPostCreated
}) => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['twitter', 'linkedin']);
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule' | 'draft'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const platforms: { id: PlatformType; label: string; color: string }[] = [
    { id: 'twitter', label: 'Twitter / X', color: 'hover:border-sky-400' },
    { id: 'linkedin', label: 'LinkedIn', color: 'hover:border-blue-600' },
    { id: 'instagram', label: 'Instagram', color: 'hover:border-pink-500' },
    { id: 'facebook', label: 'Facebook', color: 'hover:border-blue-500' },
    { id: 'youtube', label: 'YouTube', color: 'hover:border-red-500' }
  ];

  const togglePlatform = (plt: PlatformType) => {
    if (selectedPlatforms.includes(plt)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plt));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, plt]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please enter some text for your post.');
      return;
    }

    if (scheduleMode === 'schedule' && !scheduledAt) {
      setError('Please select a date and time to schedule your post.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postsApi.createPost({
        platforms: selectedPlatforms,
        content,
        mediaUrl: mediaUrl.trim() || undefined,
        scheduledAt: scheduleMode === 'schedule' ? scheduledAt : undefined,
        isDraft: scheduleMode === 'draft'
      });

      onPostCreated(res.post);
      onClose();
      // Reset form
      setContent('');
      setMediaUrl('');
      setScheduleMode('now');
      setScheduledAt('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post. Check your permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <span>Compose Social Post</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Platform Multi-Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Publishing Channels
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 ' +
                          p.color
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-bold uppercase tracking-wider text-slate-400">Post Message</label>
              <span className={`font-mono text-[11px] ${content.length > 280 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                {content.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share with your audience? Write announcements, links, or insights..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition resize-none"
            />
          </div>

          {/* Media URL attachment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Media Image URL (Optional)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or image link"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <button
                type="button"
                onClick={() => setMediaUrl('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800')}
                className="px-2.5 py-2 text-[11px] font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Sample Image
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          {content && (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Live Post Preview</div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    Ω
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">OmniTech Corporation</div>
                    <div className="text-[10px] text-slate-400">Publishing to {selectedPlatforms.join(', ')}</div>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs whitespace-pre-line">{content}</p>
                {mediaUrl && (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="mt-2.5 rounded-lg max-h-40 w-full object-cover border border-slate-100 dark:border-slate-800"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                )}
              </div>
            </div>
          )}

          {/* Schedule Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScheduleMode('now')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  scheduleMode === 'now'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Publish Now
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('schedule')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  scheduleMode === 'schedule'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Schedule Date
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('draft')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  scheduleMode === 'draft'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Save Draft
              </button>
            </div>

            {scheduleMode === 'schedule' && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Dispatching...'
                  : scheduleMode === 'now'
                  ? 'Publish to Channels'
                  : scheduleMode === 'schedule'
                  ? 'Schedule Post'
                  : 'Save Draft'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
