"use client";

import { useState } from "react";
import { IPlace, PlaceCategory } from "@/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import {
  votePlace,
  addTip,
  summarizeTips,
  blacklistPlace,
  deletePlace,
  getUserId,
} from "@/lib/api";

interface DetailProps {
  place: IPlace;
  isAdmin: boolean;
  adminPin: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PlaceDetail({
  place,
  isAdmin,
  adminPin,
  onClose,
  onUpdate,
}: DetailProps) {
  const [newTip, setNewTip] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [voting, setVoting] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);

  const userId = getUserId();
  const userVote = place.votedBy?.find((v) => v.userId === userId)?.vote || null;
  const score = place.upvotes - place.downvotes;
  const color = CATEGORY_COLORS[place.category as PlaceCategory] || CATEGORY_COLORS.other;
  const icon = CATEGORY_ICONS[place.category as PlaceCategory] || "📍";

  const handleVote = async (vote: "up" | "down") => {
    if (voting) return;
    setVoting(true);
    try {
      await votePlace(place._id, userId, vote);
      onUpdate();
    } catch (err) {
      console.error("Vote failed:", err);
    }
    setVoting(false);
  };

  const handleAddTip = async () => {
    if (!newTip.trim() || tipLoading) return;
    setTipLoading(true);
    try {
      await addTip(place._id, newTip.trim());
      setNewTip("");
      onUpdate();
    } catch (err) {
      console.error("Add tip failed:", err);
    }
    setTipLoading(false);
  };

  const handleSummarize = async () => {
    if (summarizing || place.tips.length < 2) return;
    setSummarizing(true);
    setAiSummary(null);
    try {
      const summary = await summarizeTips(place._id);
      setAiSummary(summary);
    } catch (err) {
      console.error("Summarize failed:", err);
    }
    setSummarizing(false);
  };

  const handleBlacklist = async () => {
    try {
      await blacklistPlace(place._id, true, adminPin);
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Blacklist failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${place.name}" permanently?`)) return;
    try {
      await deletePlace(place._id, adminPin);
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="animate-slide-up absolute bottom-4 left-4 right-4 max-h-[55%] overflow-y-auto custom-scrollbar bg-deep/95 backdrop-blur-xl rounded-2xl border border-white/10 p-5 z-10 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: color + "22", color }}
          >
            {icon} {place.category}
          </span>
          <h2 className="text-xl font-extrabold mt-2 tracking-tight">
            {place.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="bg-white/5 hover:bg-white/10 border-none text-slate-400 rounded-lg px-2.5 py-1.5 cursor-pointer text-sm transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Votes */}
      <div className="flex gap-2 mt-3 items-center flex-wrap">
        <button
          onClick={() => handleVote("up")}
          disabled={voting}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold cursor-pointer border transition-all ${
            userVote === "up"
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
          }`}
        >
          👍 {place.upvotes}
        </button>
        <button
          onClick={() => handleVote("down")}
          disabled={voting}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold cursor-pointer border transition-all ${
            userVote === "down"
              ? "bg-red-500/20 border-red-500/30 text-red-400"
              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
          }`}
        >
          👎 {place.downvotes}
        </button>
        <span
          className={`text-sm font-bold ml-1 ${
            score > 0 ? "text-emerald-400" : score < 0 ? "text-red-400" : "text-slate-500"
          }`}
        >
          {score > 0 ? "+" : ""}
          {score} score
        </span>

        {isAdmin && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleBlacklist}
              className="bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-lg px-3 py-1.5 cursor-pointer text-xs hover:bg-amber-500/25 transition-colors"
            >
              🚫 Blacklist
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500/15 border border-red-500/30 text-red-300 rounded-lg px-3 py-1.5 cursor-pointer text-xs hover:bg-red-500/25 transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2.5">
          <div className="text-sm font-bold text-violet-400">
            💡 Community Tips ({place.tips.length})
          </div>
          {place.tips.length >= 2 && (
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="bg-gradient-to-r from-violet-600 to-blue-600 border-none text-white rounded-lg px-3 py-1 cursor-pointer text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {summarizing ? "✨ Summarizing..." : "✨ AI Summary"}
            </button>
          )}
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="animate-slide-up bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-3 mb-3">
            <div className="text-[11px] font-bold text-violet-400 mb-1.5">
              ✨ AI-POWERED SUMMARY
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {aiSummary}
            </div>
          </div>
        )}
        {summarizing && (
          <div className="animate-shimmer h-16 rounded-xl mb-3" />
        )}

        {/* Tips list */}
        <div className="space-y-1">
          {place.tips.map((tip, i) => (
            <div
              key={i}
              className="px-3 py-2 bg-white/[0.03] rounded-lg text-sm text-slate-300"
              style={{ borderLeft: `3px solid ${color}44` }}
            >
              {tip}
            </div>
          ))}
        </div>

        {/* Add tip */}
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            placeholder="Share a tip about this place..."
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTip()}
            maxLength={500}
            className="flex-1 bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/40 transition-colors placeholder:text-slate-600"
          />
          <button
            onClick={handleAddTip}
            disabled={!newTip.trim() || tipLoading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              newTip.trim()
                ? "bg-violet-600 text-white cursor-pointer hover:bg-violet-500"
                : "bg-muted text-slate-600 cursor-not-allowed"
            }`}
          >
            {tipLoading ? "..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
