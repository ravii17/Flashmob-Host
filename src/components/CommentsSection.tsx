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
  organizerId?: string;
}

export default function CommentsSection({ eventId, currentUser, organizerId }: CommentsSectionProps) {
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
      <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
        <MessageSquare size={18} className="text-pink-500" />
        <h3 className="text-base font-black text-white uppercase tracking-wider">Fan Chat ({comments.length})</h3>
      </div>

      {/* Write Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-gradient-to-tr from-pink-500 to-purple-650 text-white shrink-0 flex items-center justify-center font-bold text-xs shadow-[0_0_8px_rgba(255,0,127,0.3)]">
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
              placeholder="Say something to the vibe crew..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              className="w-full bg-white/5 hover:bg-white/10 focus:bg-zinc-950/60 text-sm text-white placeholder-zinc-500 px-4 py-2.5 rounded-2xl border border-white/10 focus:border-pink-500 focus:outline-none transition-all pr-12 focus:shadow-[0_0_12px_rgba(255,0,127,0.25)]"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="absolute right-2 top-1.5 p-1 text-pink-500 hover:text-pink-400 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-xs text-zinc-400 font-medium">
            Please{' '}
            <a href={`/login?redirect=/events/${eventId}`} className="text-pink-500 font-bold hover:underline">
              log in
            </a>{' '}
            to join the vibe chat.
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-white/5 border border-white/5 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-white/5 rounded w-1/4"></div>
                <div className="h-3 bg-white/5 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 divide-y divide-white/5">
          {comments.map((comment, index) => {
            const isHost = organizerId && comment.user.id === organizerId;
            return (
              <div key={comment.id} className={`flex space-x-3 ${index > 0 ? 'pt-4' : ''}`}>
                <div className={`w-8 h-8 rounded-full overflow-hidden border shrink-0 flex items-center justify-center font-bold text-xs text-white ${
                  isHost 
                    ? 'border-pink-500 bg-gradient-to-tr from-pink-500 via-purple-650 to-pink-500 shadow-[0_0_8px_rgba(255,0,127,0.5)]' 
                    : 'border-white/10 bg-gradient-to-tr from-zinc-700 to-zinc-800'
                }`}>
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
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-white leading-none">{comment.user.name}</h4>
                      {isHost && (
                        <span className="text-[8px] font-black text-pink-400 bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded-sm uppercase tracking-widest shadow-[0_0_8px_rgba(255,0,127,0.15)]">
                          Crew Leader
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-500 font-medium">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className={`text-xs leading-normal font-medium p-3 rounded-2xl rounded-tl-none border ${
                    isHost 
                      ? 'bg-pink-500/5 border-pink-500/25 text-pink-100 shadow-[inset_0_0_10px_rgba(255,0,127,0.05)]' 
                      : 'bg-zinc-900/60 border-white/5 text-zinc-300'
                  }`}>
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-xs text-zinc-500 font-medium">No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
}
