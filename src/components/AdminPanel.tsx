"use client";

import { useState, useEffect } from "react";
import { IPlace, PlaceCategory } from "@/types";
import { CATEGORY_ICONS } from "@/lib/constants";
import {
  adminAuth,
  fetchPlaces,
  blacklistPlace,
  deletePlace,
} from "@/lib/api";

interface AdminPanelProps {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  adminPin: string;
  setAdminPin: (v: string) => void;
  onUpdate: () => void;
  onClose: () => void;
}

export default function AdminPanel({
  isAdmin,
  setIsAdmin,
  adminPin,
  setAdminPin,
  onUpdate,
  onClose,
}: AdminPanelProps) {
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [allPlaces, setAllPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) loadAllPlaces();
  }, [isAdmin]);

  const loadAllPlaces = async () => {
    setLoading(true);
    try {
      const places = await fetchPlaces({ admin: true });
      setAllPlaces(places);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setAuthError("");
    const ok = await adminAuth(pinInput);
    if (ok) {
      setIsAdmin(true);
      setAdminPin(pinInput);
      setPinInput("");
    } else {
      setAuthError("Invalid PIN");
    }
  };

  const handleBlacklist = async (id: string, blacklisted: boolean) => {
    try {
      await blacklistPlace(id, blacklisted, adminPin);
      await loadAllPlaces();
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"?`)) return;
    try {
      await deletePlace(id, adminPin);
      await loadAllPlaces();
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const blacklisted = allPlaces.filter((p) => p.blacklisted);
  const active = allPlaces.filter((p) => !p.blacklisted);

  return (
    <div className="animate-slide-up absolute top-14 right-4 w-80 max-h-[75vh] bg-surface rounded-xl border border-white/10 z-[200] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-base">Admin Panel</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {!isAdmin ? (
          <div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter admin PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="flex-1 bg-deep border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/40"
              />
              <button
                onClick={handleLogin}
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-colors"
              >
                Enter
              </button>
            </div>
            {authError && (
              <p className="text-red-400 text-xs mt-2">{authError}</p>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <span className="text-emerald-400 text-xs">✓ Admin access granted</span>
            <button
              onClick={() => {
                setIsAdmin(false);
                setAdminPin("");
                onClose();
              }}
              className="ml-auto text-red-400 text-xs hover:text-red-300 cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Place management */}
      {isAdmin && (
        <div className="overflow-y-auto max-h-[58vh] custom-scrollbar p-3 space-y-3">
          {loading ? (
            <div className="text-center text-slate-500 py-8 text-sm">Loading...</div>
          ) : (
            <>
              {/* Blacklisted */}
              {blacklisted.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wider">
                    🚫 Blacklisted ({blacklisted.length})
                  </div>
                  {blacklisted.map((p) => (
                    <div
                      key={p._id}
                      className="flex justify-between items-center p-2 bg-red-500/5 rounded-lg mb-1"
                    >
                      <span className="text-sm truncate flex-1">
                        {CATEGORY_ICONS[p.category as PlaceCategory]} {p.name}
                      </span>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleBlacklist(p._id, false)}
                          className="bg-emerald-500/15 text-emerald-300 border-none rounded px-2 py-1 text-[11px] cursor-pointer hover:bg-emerald-500/25"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="bg-red-500/15 text-red-300 border-none rounded px-2 py-1 text-[11px] cursor-pointer hover:bg-red-500/25"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Active */}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Active Places ({active.length})
                </div>
                {active.map((p) => (
                  <div
                    key={p._id}
                    className="flex justify-between items-center p-2 bg-white/[0.02] rounded-lg mb-1 hover:bg-white/[0.04]"
                  >
                    <span className="text-sm truncate flex-1">
                      {CATEGORY_ICONS[p.category as PlaceCategory]} {p.name}
                    </span>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleBlacklist(p._id, true)}
                        className="bg-amber-500/15 text-amber-300 border-none rounded px-2 py-1 text-[11px] cursor-pointer hover:bg-amber-500/25"
                      >
                        Ban
                      </button>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="bg-red-500/15 text-red-300 border-none rounded px-2 py-1 text-[11px] cursor-pointer hover:bg-red-500/25"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
