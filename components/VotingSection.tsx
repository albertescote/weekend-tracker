"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { updateComment, updateStatus } from "@/app/actions/plans";
import {
  Check,
  MessageSquareText,
  Minus,
  SendHorizontal,
  X,
} from "lucide-react";

type Status = "going" | "not_going" | "pending" | null;

interface Props {
  userId: string;
  weekendDate: string;
  initialStatus: Status;
  initialComment?: string | null;
  displayDate: string;
}

export default function VotingSection({
  userId,
  weekendDate,
  initialStatus,
  initialComment,
  displayDate,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState(initialComment || "");
  const [showComment, setShowComment] = useState(!!initialComment);
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    initialStatus,
    (_, newStatus: Status) => newStatus,
  );

  const hasCommentChanged = comment !== (initialComment || "");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setComment(initialComment || "");
    setShowComment(!!initialComment);
  }, [initialComment, weekendDate]);

  async function handleVote(status: "going" | "not_going" | "pending") {
    startTransition(async () => {
      setOptimisticStatus(status);
      try {
        await updateStatus(userId, weekendDate, status, comment);
      } catch (error) {
        console.error(error);
      }
    });
  }

  async function handleSaveComment() {
    startTransition(async () => {
      try {
        await updateComment(userId, weekendDate, comment);
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
      <div className="text-center space-y-0.5">
        <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
          Hi seràs?
        </h2>
        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400">
          Cap de setmana del {displayDate}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleVote("going")}
          disabled={isPending}
          className={`px-4 py-3 rounded-2xl transition-all ${
            optimisticStatus === "going"
              ? "bg-green-500 text-white shadow-lg scale-110"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          <Check size={32} />
          <span className="block text-xs mt-1 font-medium text-center">Sí</span>
        </button>

        <button
          onClick={() => handleVote("not_going")}
          disabled={isPending}
          className={`px-4 py-3 rounded-2xl transition-all ${
            optimisticStatus === "not_going"
              ? "bg-red-500 text-white shadow-lg scale-110"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          <X size={32} />
          <span className="block text-xs mt-1 font-medium text-center">No</span>
        </button>

        <button
          onClick={() => handleVote("pending")}
          disabled={isPending}
          className={`px-4 py-3 rounded-2xl transition-all ${
            optimisticStatus === "pending"
              ? "bg-zinc-400 text-white shadow-lg scale-110"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          <Minus size={32} />
          <span className="block text-xs mt-1 font-medium text-center">
            Potser
          </span>
        </button>
      </div>

      <div className="w-full">
        {!showComment && !initialComment ? (
          <button
            onClick={() => setShowComment(true)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors mx-auto"
          >
            <MessageSquareText size={14} />
            Afegir comentari
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="relative flex items-center">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex: Tinc un sopar dissabte..."
                className="w-full p-3 pr-12 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[60px] transition-all"
                maxLength={140}
              />
              <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
                <span className={`text-[8px] font-black ${comment.length >= 130 ? 'text-red-500' : 'text-zinc-400'}`}>
                  {comment.length}/140
                </span>
                {hasCommentChanged && (
                  <button
                    onClick={handleSaveComment}
                    disabled={isPending}
                    className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    title="Guardar comentari"
                  >
                    <SendHorizontal size={16} />
                  </button>
                )}
              </div>
            </div>
            {hasCommentChanged && (
              <p className="text-[9px] text-blue-500 font-bold text-center uppercase tracking-wider animate-pulse">
                Comentari pendent de guardar
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
