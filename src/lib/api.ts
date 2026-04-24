import { IPlace, ApiResponse } from "@/types";

const BASE = "/api";

// ── User ID (anonymous, stored in localStorage) ──
export function getUserId(): string {
  if (typeof window === "undefined") return "ssr";
  let uid = localStorage.getItem("blr-uid");
  if (!uid) {
    uid = "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem("blr-uid", uid);
  }
  return uid;
}

// ── Places ──
export async function fetchPlaces(params?: {
  category?: string;
  search?: string;
  sort?: string;
  admin?: boolean;
}): Promise<IPlace[]> {
  const qs = new URLSearchParams();
  if (params?.category && params.category !== "all") qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.admin) qs.set("admin", "true");

  const res = await fetch(`${BASE}/places?${qs.toString()}`);
  const json: ApiResponse<IPlace[]> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!;
}

export async function createPlace(data: {
  name: string;
  lat: number;
  lng: number;
  category: string;
  tip?: string;
  addedBy?: string;
}): Promise<IPlace> {
  const res = await fetch(`${BASE}/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: ApiResponse<IPlace> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!;
}

// ── Voting ──
export async function votePlace(
  placeId: string,
  userId: string,
  vote: "up" | "down"
): Promise<{ upvotes: number; downvotes: number; userVote: string | null }> {
  const res = await fetch(`${BASE}/places/${placeId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, vote }),
  });
  const json: ApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data as { upvotes: number; downvotes: number; userVote: string | null };
}

// ── Tips ──
export async function addTip(placeId: string, tip: string): Promise<string[]> {
  const res = await fetch(`${BASE}/places/${placeId}/tips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tip }),
  });
  const json: ApiResponse<{ tips: string[] }> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!.tips;
}

export async function summarizeTips(placeId: string): Promise<string> {
  const res = await fetch(`${BASE}/places/${placeId}/tips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ summarize: true }),
  });
  const json: ApiResponse<{ summary: string }> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!.summary;
}

// ── Admin ──
export async function adminAuth(pin: string): Promise<boolean> {
  const res = await fetch(`${BASE}/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  const json: ApiResponse<{ authenticated: boolean }> = await res.json();
  return json.success && json.data!.authenticated;
}

export async function blacklistPlace(
  placeId: string,
  blacklisted: boolean,
  adminPin: string
): Promise<IPlace> {
  const res = await fetch(`${BASE}/places/${placeId}/blacklist`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": adminPin,
    },
    body: JSON.stringify({ blacklisted }),
  });
  const json: ApiResponse<IPlace> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!;
}

export async function deletePlace(placeId: string, adminPin: string): Promise<void> {
  const res = await fetch(`${BASE}/places/${placeId}`, {
    method: "DELETE",
    headers: { "x-admin-pin": adminPin },
  });
  const json: ApiResponse = await res.json();
  if (!json.success) throw new Error(json.error);
}
