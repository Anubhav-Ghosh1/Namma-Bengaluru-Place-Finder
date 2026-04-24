import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Place } from "@/models/Place";

// POST /api/places/[id]/vote
// Body: { userId: string, vote: "up" | "down" }
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { userId, vote } = await req.json();

    if (!userId || !["up", "down"].includes(vote)) {
      return NextResponse.json(
        { success: false, error: "userId and vote (up/down) required" },
        { status: 400 }
      );
    }

    const place = await Place.findById(params.id);
    if (!place) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }

    // Find existing vote by this user
    const existingVoteIndex = place.votedBy.findIndex(
      (v: { userId: string; vote: string }) => v.userId === userId
    );

    if (existingVoteIndex >= 0) {
      const existingVote = place.votedBy[existingVoteIndex];

      if (existingVote.vote === vote) {
        // Same vote → undo it
        if (vote === "up") place.upvotes = Math.max(0, place.upvotes - 1);
        else place.downvotes = Math.max(0, place.downvotes - 1);
        place.votedBy.splice(existingVoteIndex, 1);
      } else {
        // Switch vote
        if (existingVote.vote === "up") {
          place.upvotes = Math.max(0, place.upvotes - 1);
          place.downvotes += 1;
        } else {
          place.downvotes = Math.max(0, place.downvotes - 1);
          place.upvotes += 1;
        }
        place.votedBy[existingVoteIndex].vote = vote;
      }
    } else {
      // New vote
      if (vote === "up") place.upvotes += 1;
      else place.downvotes += 1;
      place.votedBy.push({ userId, vote });
    }

    await place.save();

    return NextResponse.json({
      success: true,
      data: {
        upvotes: place.upvotes,
        downvotes: place.downvotes,
        userVote: place.votedBy.find(
          (v: { userId: string }) => v.userId === userId
        )?.vote || null,
      },
    });
  } catch (error) {
    console.error("POST /api/places/[id]/vote error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
