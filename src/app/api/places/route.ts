import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Place } from "@/models/Place";

// GET /api/places — fetch all non-blacklisted places (admin sees all)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const showBlacklisted = searchParams.get("admin") === "true";
    const sort = searchParams.get("sort") || "votes";

    const filter: Record<string, unknown> = {};
    if (!showBlacklisted) filter.blacklisted = false;
    if (category && category !== "all") filter.category = category;

    let query = Place.find(filter);

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { tips: { $regex: search, $options: "i" } },
      ];
      query = Place.find(filter);
    }

    if (sort === "votes") {
      query = query.sort({ upvotes: -1, downvotes: 1 });
    } else if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ name: 1 });
    }

    const places = await query.lean();

    return NextResponse.json({ success: true, data: places });
  } catch (error) {
    console.error("GET /api/places error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}

// POST /api/places — add a new place
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, lat, lng, category, tip, addedBy } = body;

    if (!name || !lat || !lng || !category) {
      return NextResponse.json(
        { success: false, error: "name, lat, lng, category are required" },
        { status: 400 }
      );
    }

    const place = await Place.create({
      name: name.trim(),
      lat,
      lng,
      category,
      tips: tip ? [tip.trim()] : [],
      upvotes: 0,
      downvotes: 0,
      votedBy: [],
      blacklisted: false,
      addedBy: addedBy || "anonymous",
    });

    return NextResponse.json({ success: true, data: place }, { status: 201 });
  } catch (error) {
    console.error("POST /api/places error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create place" },
      { status: 500 }
    );
  }
}
