"use client";

import { useState, useRef, useCallback } from "react";
import { Profile } from "@/types";
import UserSummaryModal from "./UserSummaryModal";
import Portal from "./Portal";
import { Quote, X } from "lucide-react";

interface Props {
  profile: Profile;
  comment?: string | null;
}

export default function UserAttendanceCard({ profile, comment }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const startLongPress = useCallback(() => {
    isLongPress.current = false;
    if (!comment) return;
    
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowCommentPopup(true);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
  }, [comment]);

  const endLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isLongPress.current) {
      setShowModal(true);
    }
  }, []);

  return (
    <>
      <div
        onClick={handleClick}
        onMouseDown={startLongPress}
        onMouseUp={endLongPress}
        onMouseLeave={endLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={endLongPress}
        onTouchMove={endLongPress}
        className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-700 select-none"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-700 shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-zinc-500 font-bold uppercase">
              {(profile.full_name || profile.email)[0]}
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm truncate">
            {profile.full_name || profile.email.split("@")[0]}
          </span>
          {comment && (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 italic">
              &quot;{comment}&quot;
            </span>
          )}
        </div>
      </div>

      {showModal && (
        <UserSummaryModal
          profile={profile}
          onClose={() => setShowModal(false)}
        />
      )}

      {showCommentPopup && comment && (
        <Portal>
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowCommentPopup(false)}
          >
            <div 
              className="bg-white dark:bg-zinc-900 w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowCommentPopup(false)}
                className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
                  <Quote size={24} fill="currentColor" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Comentari de {profile.full_name?.split(' ')[0] || profile.email.split('@')[0]}
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 leading-relaxed italic">
                    &quot;{comment}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
