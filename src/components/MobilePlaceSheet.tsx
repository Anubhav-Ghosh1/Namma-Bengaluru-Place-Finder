"use client";

import { useRef, useState } from "react";
import { IPlace, PlaceCategory } from "@/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import { votePlace, getUserId } from "@/lib/api";

interface MobilePlaceSheetProps {
  places: IPlace[];
  selectedPlace: IPlace | null;
  onSelectPlace: (place: IPlace) => void;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}

export default function MobilePlaceSheet({
  places,
  selectedPlace,
  onSelectPlace,
  onClose,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
}: MobilePlaceSheetProps) {
  const [voting, setVoting] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  const handleVote = async (placeId: string, vote: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    if (voting) return;
    setVoting(placeId);
    try {
      await votePlace(placeId, userId, vote);
    } catch (err) {
      console.error(err);
    }
    setVoting(null);
  };

  const score = (p: IPlace) => p.upvotes - p.downvotes;
  const userVote = (p: IPlace) =>
    p.votedBy?.find((v) => v.userId === userId)?.vote || null;

  return (
    <div className="fixed inset-0 z-[300] md:hidden" onClick={onClose}>
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-deep rounded-t-3xl border-t border-white/10 flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle + header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
          <div className="flex-1 flex justify-center">
            <div className="w-10 h-1 bg-white/20 rounded-full mb-1" />
          </div>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-bold text-slate-200">
            📍 {places.length} places
          </span>
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 border-none text-slate-400 rounded-lg px-3 py-1.5 cursor-pointer text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2 shrink-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/[0.08] rounded-xl px-3 py-2.5 pl-9 text-sm text-slate-200 outline-none focus:border-violet-500/30 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
              activeCategory === "all"
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-slate-400"
            }`}
          >
            All
          </button>
          {["food", "cafe", "park", "landmark", "shopping", "nightlife", "nature", "sports", "culture", "other"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
                activeCategory === cat ? "text-white" : "bg-white/5 text-slate-400"
              }`}
              style={activeCategory === cat ? { background: CATEGORY_COLORS[cat as PlaceCategory] } : {}}
            >
              {CATEGORY_ICONS[cat as PlaceCategory]} {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-1 px-4 py-2 border-b border-white/5 shrink-0">
          {[
            { key: "votes", label: "Top" },
            { key: "newest", label: "New" },
            { key: "name", label: "A-Z" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${
                sortBy === s.key
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-slate-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Place list — scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {places.map((p) => (
            <div
              key={p._id}
              onClick={() => {
                onSelectPlace(p);
                onClose();
              }}
              className={`p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                selectedPlace?._id === p._id
                  ? "bg-violet-500/12 border border-violet-500/30"
                  : "bg-white/[0.02] border border-transparent active:bg-white/[0.04]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1"
                    style={{
                      background: CATEGORY_COLORS[p.category as PlaceCategory] + "22",
                      color: CATEGORY_COLORS[p.category as PlaceCategory],
                    }}
                  >
                    {CATEGORY_ICONS[p.category as PlaceCategory]} {p.category}
                  </span>
                  <div className="font-semibold text-sm text-slate-200">{p.name}</div>
                  {p.tips.length > 0 && (
                    <div className="text-xs text-slate-500 mt-1 truncate">
                      {p.tips[0]}
                    </div>
                  )}
                </div>

                {/* Vote controls */}
                <div
                  className="flex flex-col items-center gap-0.5 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleVote(p._id, "up", e)}
                    className={`text-base px-1.5 py-0.5 rounded cursor-pointer transition-colors active:scale-110 ${
                      userVote(p) === "up"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "text-slate-600"
                    }`}
                  >
                    ▲
                  </button>
                  <span
                    className={`text-xs font-bold ${
                      score(p) > 0 ? "text-emerald-400" : score(p) < 0 ? "text-red-400" : "text-slate-600"
                    }`}
                  >
                    {score(p)}
                  </span>
                  <button
                    onClick={(e) => handleVote(p._id, "down", e)}
                    className={`text-base px-1.5 py-0.5 rounded cursor-pointer transition-colors active:scale-110 ${
                      userVote(p) === "down"
                        ? "bg-red-500/20 text-red-400"
                        : "text-slate-600"
                    }`}
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          ))}

          {places.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <div className="text-3xl mb-3">🔍</div>
              <div className="text-sm">No places found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}