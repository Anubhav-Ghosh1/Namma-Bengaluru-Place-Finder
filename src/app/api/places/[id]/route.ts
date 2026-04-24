import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Place } from "@/models/Place";

// GET /api/places/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const place = await Place.findById(params.id).lean();
    if (!place) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: place });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch place" },
      { status: 500 }
    );
  }
}

// DELETE /api/places/[id] — admin only
export async function DELETE(
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
    const place = await Place.findByIdAndDelete(params.id);
    if (!place) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete place" },
      { status: 500 }
    );
  }
}
