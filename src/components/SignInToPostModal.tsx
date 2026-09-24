import React, { useState } from 'react';
import { useFirebase } from '../firebase/FirebaseContext';
import { X, Sparkles, Cloud, Lock, Pin } from 'lucide-react';
import { User } from 'firebase/auth';
import { playMechanicalClick, playPaperRustleSound } from '../utils/audio';

export interface PendingPostItem {
  type: 'note' | 'polaroid';
  title?: string;
  name?: string;
  message?: string;
  color?: string;
  fontClass?: string;
  emoji?: string;
  imageUrl?: string;
  gradient?: string;
  date?: string;
  washiColor?: string;
}

interface SignInToPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onPostAsGuest?: () => void;
  pendingItem?: PendingPostItem | null;
}

export const SignInToPostModal: React.FC<SignInToPostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onPostAsGuest,
  pendingItem,
}) => {
  const { signInWithGoogle, authError } = useFirebase();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setLocalError(null);
      playMechanicalClick('toggle', 0.08);

      const user = await signInWithGoogle();
      if (user) {
        playPaperRustleSound('drop', 0.1);
        onSuccess(user);
      }
    } catch (err: any) {
      console.warn('Sign-in failed:', err);
      setLocalError(err?.message || 'Unable to sign in with Google. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const isPolaroid = pendingItem?.type === 'polaroid';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col">
        {/* Top Decorative Header Accent */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xl shadow-inner shrink-0">
              {isPolaroid ? '📸' : '📌'}
            </div>
            <div>
              <h3
                id="signin-modal-title"
                className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-1.5"
              >
                <span>Sign in with Google to Post</span>
              </h3>
              <p className="text-[11px] font-mono text-amber-300/80 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Live Community Bulletin Board</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playMechanicalClick('subtle', 0.06);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Cancel and keep editing draft"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Informational Message */}
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            The Community Bulletin Board is a real-time board shared across all cozy desks. To post your{' '}
            <strong className="text-amber-300 font-semibold">
              {isPolaroid ? 'photo memory' : 'corkboard note'}
            </strong>{' '}
            and preserve your creator credit, please sign in with your Google account.
          </div>

          {/* Draft Preview Box */}
          {pendingItem && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-amber-400/90 font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Draft Ready to Pin:</span>
                </span>
                <span className="text-[10px] text-slate-500">Won't be lost</span>
              </div>

              {isPolaroid ? (
                /* Polaroid Mini Preview */
                <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-14 h-14 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-black/30 flex items-center justify-center relative">
                    {pendingItem.imageUrl ? (
                      <img
                        src={pendingItem.imageUrl}
                        alt="Polaroid thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${
                          pendingItem.gradient || 'from-amber-600 to-orange-800'
                        } flex items-center justify-center text-xl`}
                      >
                        {pendingItem.emoji || '📸'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-display font-bold text-white truncate">
                      {pendingItem.title || 'Cozy Polaroid'}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 font-hand leading-tight mt-0.5">
                      "{pendingItem.message || 'No caption'}"
                    </p>
                    <span className="text-[10px] font-mono text-amber-300/80">
                      By {pendingItem.name || 'Cozy Explorer'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Memo Note Mini Preview */
                <div
                  style={{ backgroundColor: pendingItem.color || '#fef08a' }}
                  className="p-3 rounded-xl border border-black/10 shadow-sm text-slate-900"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1 opacity-80">
                    <span>{pendingItem.name || 'Cozy Explorer'}</span>
                    <span>{pendingItem.emoji || '📌'}</span>
                  </div>
                  <p
                    className={`${
                      pendingItem.fontClass || 'font-hand'
                    } text-sm leading-snug line-clamp-3 text-slate-950`}
                  >
                    "{pendingItem.message}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {(localError || authError) && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
              ⚠️ {localError || authError}
            </div>
          )}

          {/* Primary Action: Visible Sign in with Google */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              disabled={isSigningIn}
              onClick={handleSignIn}
              className="w-full min-h-[48px] px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign in with Google to Post</span>
                </>
              )}
            </button>

            {/* Guest Fallback: Pin directly without sign-in */}
            {onPostAsGuest && (
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick('toggle', 0.07);
                  onPostAsGuest();
                  onClose();
                }}
                className="w-full min-h-[46px] px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 active:scale-[0.98] text-amber-300 font-mono text-xs rounded-2xl border border-amber-400/40 transition cursor-pointer flex items-center justify-center gap-2 touch-manipulation"
              >
                <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pin Directly as Guest (Local Desk Board) 📌</span>
              </button>
            )}

            {/* Cancel / Keep Draft Button */}
            <button
              type="button"
              onClick={() => {
                playMechanicalClick('subtle', 0.06);
                onClose();
              }}
              className="w-full min-h-[44px] px-3 py-2 text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Keep editing draft without posting</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
            <Lock className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Secure official Google authentication • No password required</span>
          </div>
        </div>
      </div>
    </div>
  );
};
