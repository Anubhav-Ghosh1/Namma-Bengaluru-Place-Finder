import { PlaceCategory } from "@/types";

export const BANGALORE_CENTER: [number, number] = [12.9716, 77.5946];

export const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  food: "#F59E0B",
  culture: "#8B5CF6",
  nature: "#10B981",
  shopping: "#EC4899",
  nightlife: "#EF4444",
  adventure: "#3B82F6",
  wellness: "#14B8A6",
  other: "#6B7280",
};

export const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  food: "🍛",
  culture: "🏛️",
  nature: "🌳",
  shopping: "🛍️",
  nightlife: "🌙",
  adventure: "🏔️",
  wellness: "🧘",
  other: "📍",
};

export const ALL_CATEGORIES: PlaceCategory[] = [
  "food",
  "culture",
  "nature",
  "shopping",
  "nightlife",
  "adventure",
  "wellness",
  "other",
];
