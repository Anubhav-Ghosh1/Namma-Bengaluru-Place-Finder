import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/auth
// Body: { pin: string }
export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "PIN required" },
        { status: 400 }
      );
    }

    if (pin === process.env.ADMIN_PIN) {
      return NextResponse.json({ success: true, data: { authenticated: true } });
    }

    return NextResponse.json(
      { success: false, error: "Invalid PIN" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Auth failed" },
      { status: 500 }
    );
  }
}
