import mongoose, { Schema, Document } from "mongoose";

export interface IPlaceDoc extends Document {
  name: string;
  lat: number;
  lng: number;
  category: string;
  tips: string[];
  upvotes: number;
  downvotes: number;
  votedBy: { userId: string; vote: "up" | "down" }[];
  blacklisted: boolean;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema(
  {
    userId: { type: String, required: true },
    vote: { type: String, enum: ["up", "down"], required: true },
  },
  { _id: false }
);

const PlaceSchema = new Schema<IPlaceDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["food", "culture", "nature", "shopping", "nightlife", "adventure", "wellness", "other"],
      default: "other",
    },
    tips: [{ type: String, trim: true, maxlength: 500 }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    votedBy: [VoteSchema],
    blacklisted: { type: Boolean, default: false },
    addedBy: { type: String, default: "anonymous" },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial and text queries
PlaceSchema.index({ name: "text", tips: "text" });
PlaceSchema.index({ category: 1 });
PlaceSchema.index({ blacklisted: 1 });

export const Place =
  mongoose.models.Place || mongoose.model<IPlaceDoc>("Place", PlaceSchema);
