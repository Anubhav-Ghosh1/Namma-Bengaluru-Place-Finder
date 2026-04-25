"use client";

import { useState } from "react";
import { IPlace, PlaceCategory } from "@/types";
import { CATEGORY_COLORS, CATEGORY_ICONS, ALL_CATEGORIES } from "@/lib/constants";
import { votePlace, getUserId } from "@/lib/api";

interface SidebarProps {
  places: IPlace[];
  selectedPlace: IPlace | null;
  onSelectPlace: (place: IPlace) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  showAddForm: boolean;
  setShowAddForm: (v: boolean) => void;
  addCoords: { lat: number; lng: number } | null;
  onAddPlace: (data: { name: string; category: string; tip: string }) => void;
  onVoteUpdate: () => void;
}

export default function Sidebar({
  places,
  selectedPlace,
  onSelectPlace,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
  showAddForm,
  setShowAddForm,
  addCoords,
  onAddPlace,
  onVoteUpdate,
}: SidebarProps) {
  const [newPlace, setNewPlace] = useState({ name: "", category: "food", tip: "" });
  const [voting, setVoting] = useState<string | null>(null);
  const userId = getUserId();

  const handleVote = async (placeId: string, vote: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    if (voting) return;
    setVoting(placeId);
    try {
      await votePlace(placeId, userId, vote);
      onVoteUpdate();
    } catch (err) {
      console.error(err);
    }
    setVoting(null);
  };

  const handleSubmit = () => {
    if (!newPlace.name.trim() || !addCoords) return;
    onAddPlace(newPlace);
    setNewPlace({ name: "", category: "food", tip: "" });
  };

  const score = (p: IPlace) => p.upvotes - p.downvotes;
  const userVote = (p: IPlace) =>
    p.votedBy?.find((v) => v.userId === userId)?.vote || null;

  return (
    <div className="w-[380px] min-w-[380px] bg-deep border-r border-white/5 flex flex-col overflow-hidden z-50 sidebar-desktop">
      {/* Search */}

      {/* Search */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search places or tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-white/[0.08] rounded-xl px-3 py-2.5 pl-9 text-sm text-slate-200 outline-none focus:border-violet-500/30 transition-colors placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-white/5 custom-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
            activeCategory === "all"
              ? "bg-violet-600 text-white"
              : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
              activeCategory === cat
                ? "text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
            style={
              activeCategory === cat ? { background: CATEGORY_COLORS[cat] } : {}
            }
          >
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Sort + Add */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-white/5">
        <div className="flex gap-1">
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
                  : "text-slate-600 hover:text-slate-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
            showAddForm
              ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
              : "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90"
          }`}
        >
          {showAddForm ? "✕ Cancel" : "+ Add Place"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="animate-slide-up p-4 bg-[#1a2235] border-b border-violet-500/20 space-y-2">
          <div className="text-sm font-semibold text-violet-400">
            📌 Click on the map to set location
          </div>
          {addCoords && (
            <div className="text-xs text-emerald-400">
              ✓ Location: {addCoords.lat.toFixed(4)}, {addCoords.lng.toFixed(4)}
            </div>
          )}
          <input
            type="text"
            placeholder="Place name"
            value={newPlace.name}
            onChange={(e) => setNewPlace((p) => ({ ...p, name: e.target.value }))}
            maxLength={200}
            className="w-full bg-deep border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/30"
          />
          <select
            value={newPlace.category}
            onChange={(e) => setNewPlace((p) => ({ ...p, category: e.target.value }))}
            className="w-full bg-deep border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          >
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Your tip for this place (optional)"
            value={newPlace.tip}
            onChange={(e) => setNewPlace((p) => ({ ...p, tip: e.target.value }))}
            rows={2}
            maxLength={500}
            className="w-full bg-deep border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none resize-none focus:border-violet-500/30"
          />
          <button
            onClick={handleSubmit}
            disabled={!newPlace.name.trim() || !addCoords}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all ${
              newPlace.name.trim() && addCoords
                ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white cursor-pointer hover:opacity-90"
                : "bg-muted text-slate-600 cursor-not-allowed"
            }`}
          >
            Add to Map
          </button>
        </div>
      )}

      {/* Place List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {places.map((p) => (
          <div
            key={p._id}
            onClick={() => onSelectPlace(p)}
            className={`animate-fade-in p-3 rounded-xl cursor-pointer transition-all ${
              selectedPlace?._id === p._id
                ? "bg-violet-500/12 border border-violet-500/30"
                : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]"
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
                <div className="font-semibold text-sm">{p.name}</div>
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
                  className={`text-base px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    userVote(p) === "up"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-600 hover:text-slate-400"
                  }`}
                >
                  ▲
                </button>
                <span
                  className={`text-xs font-bold ${
                    score(p) > 0
                      ? "text-emerald-400"
                      : score(p) < 0
                      ? "text-red-400"
                      : "text-slate-600"
                  }`}
                >
                  {score(p)}
                </span>
                <button
                  onClick={(e) => handleVote(p._id, "down", e)}
                  className={`text-base px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    userVote(p) === "down"
                      ? "bg-red-500/20 text-red-400"
                      : "text-slate-600 hover:text-slate-400"
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
            <div className="text-xs mt-1">Try a different search or category</div>
          </div>
        )}
      </div>
    </div>
  );
}
