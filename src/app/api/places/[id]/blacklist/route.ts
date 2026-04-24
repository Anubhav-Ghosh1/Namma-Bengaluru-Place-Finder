import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Place } from "@/models/Place";

// PATCH /api/places/[id]/blacklist
// Body: { blacklisted: boolean }
// Header: x-admin-pin
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminPin = req.headers.get("x-admin-pin");
    if (adminPin !== process.env.ADMIN_PIN) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { blacklisted } = await req.json();

    const place = await Place.findByIdAndUpdate(
      params.id,
      { blacklisted: !!blacklisted },
      { new: true }
    ).lean();

    if (!place) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: place });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update blacklist status" },
      { status: 500 }
    );
  }
}
