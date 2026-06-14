'use client';

import React, { useState, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CommentUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

interface CommentsSectionProps {
  eventId: string;
  currentUser: any;
}

export default function CommentsSection({ eventId, currentUser }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/events/${eventId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
        } else {
          toast.error('Failed to load comments');
        }
      } catch (err) {
        console.error('Fetch comments error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [eventId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
        toast.success('Comment posted successfully');
      } else {
        toast.error(data.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Submit comment error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
        <MessageSquare size={18} className="text-indigo-600" />
        <h3 className="text-base font-bold text-slate-800">Discussion ({comments.length})</h3>
      </div>

      {/* Write Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center font-bold text-xs text-indigo-700">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              currentUser.name[0].toUpperCase()
            )}
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Add to the conversation..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-800 placeholder-slate-400 px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition-all pr-12"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute right-2 top-1.5 p-1 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Please{' '}
            <a href={`/login?redirect=/events/${eventId}`} className="text-indigo-600 font-bold hover:underline">
              log in
            </a>{' '}
            to participate in the discussion.
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-slate-100 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                <div className="h-3 bg-slate-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 divide-y divide-slate-50">
          {comments.map((comment, index) => (
            <div key={comment.id} className={`flex space-x-3 ${index > 0 ? 'pt-4' : ''}`}>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center font-bold text-xs text-indigo-700">
                {comment.user.avatar ? (
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  comment.user.name[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 leading-none">{comment.user.name}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal font-medium bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-xs text-slate-400 font-medium">No comments yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
}
