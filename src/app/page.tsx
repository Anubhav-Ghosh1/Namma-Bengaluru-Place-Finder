"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { IPlace } from "@/types";
import { fetchPlaces, createPlace, getUserId } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import PlaceDetail from "@/components/PlaceDetail";
import AdminPanel from "@/components/AdminPanel";

// Leaflet must be loaded client-side only
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-deep">
      <div className="text-slate-500 text-sm">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<IPlace | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("votes");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addCoords, setAddCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  // Fetch places from API
  const loadPlaces = useCallback(async () => {
    try {
      const data = await fetchPlaces({
        category: activeCategory,
        search: searchQuery,
        sort: sortBy,
      });
      setPlaces(data);

      // Refresh selected place if it exists
      if (selectedPlace) {
        const updated = data.find((p) => p._id === selectedPlace._id);
        if (updated) setSelectedPlace(updated);
        else setSelectedPlace(null);
      }
    } catch (err) {
      console.error("Failed to load places:", err);
    }
    setLoading(false);
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadPlaces();
  }, [debouncedSearch]);

  const handleSelectPlace = (place: IPlace) => {
    setSelectedPlace(place);
  };

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    if (showAddForm) {
      setAddCoords(latlng);
    }
  };

  const handleAddPlace = async (data: { name: string; category: string; tip: string }) => {
    if (!addCoords) return;
    try {
      const newPlace = await createPlace({
        name: data.name,
        lat: addCoords.lat,
        lng: addCoords.lng,
        category: data.category,
        tip: data.tip || undefined,
        addedBy: getUserId(),
      });
      setShowAddForm(false);
      setAddCoords(null);
      await loadPlaces();
      setSelectedPlace(newPlace);
    } catch (err) {
      console.error("Failed to add place:", err);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden font-display">
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-deep via-[#1a1040] to-deep border-b border-violet-500/20 px-5 py-3 flex items-center justify-between relative z-[100] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xl">
            🏙️
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-none">
              Namma Bengaluru
            </h1>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest">
              Community Explorer
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setMobileListOpen(!mobileListOpen)}
            className="sidebar-mobile-toggle bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-400 cursor-pointer"
          >
            ☰ Places
          </button>

          <span className="text-[11px] bg-violet-500/15 text-violet-400 px-2.5 py-1 rounded-full border border-violet-500/20">
            {places.length} places
          </span>
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className={`rounded-lg px-2.5 py-1.5 text-sm cursor-pointer transition-all border ${
              isAdmin
                ? "bg-red-500/15 border-red-500/30 text-red-300"
                : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
            }`}
          >
            {isAdmin ? "🔓 Admin" : "⚙️"}
          </button>
        </div>
      </header>

      {/* ── Admin Panel ── */}
      {showAdmin && (
        <AdminPanel
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          adminPin={adminPin}
          setAdminPin={setAdminPin}
          onUpdate={loadPlaces}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={handleSelectPlace}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showAddForm={showAddForm}
          setShowAddForm={(v) => {
            setShowAddForm(v);
            if (!v) setAddCoords(null);
          }}
          addCoords={addCoords}
          onAddPlace={handleAddPlace}
          onVoteUpdate={loadPlaces}
        />

        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-deep">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 animate-pulse" />
                <span className="text-slate-500 text-sm">Loading Namma Bengaluru...</span>
              </div>
            </div>
          ) : (
            <MapView
              places={places}
              selectedPlace={selectedPlace}
              onSelectPlace={handleSelectPlace}
              onMapClick={handleMapClick}
              addMode={showAddForm}
            />
          )}

          {/* Add mode hint */}
          {showAddForm && !addCoords && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-violet-600/90 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-10 animate-slide-up">
              📌 Click anywhere on the map to pin a location
            </div>
          )}

          {/* Place Detail */}
          {selectedPlace && (
            <PlaceDetail
              place={selectedPlace}
              isAdmin={isAdmin}
              adminPin={adminPin}
              onClose={() => setSelectedPlace(null)}
              onUpdate={loadPlaces}
            />
          )}
        </div>
      </div>
    </div>
  );
}
