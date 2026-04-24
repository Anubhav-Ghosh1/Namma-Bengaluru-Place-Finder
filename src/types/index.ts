export interface IPlace {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  tips: string[];
  upvotes: number;
  downvotes: number;
  votedBy: VoteRecord[];
  blacklisted: boolean;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoteRecord {
  userId: string;
  vote: "up" | "down";
}

export type PlaceCategory =
  | "food"
  | "culture"
  | "nature"
  | "shopping"
  | "nightlife"
  | "adventure"
  | "wellness"
  | "other";

export interface PlaceFormData {
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  tip?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
