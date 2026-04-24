import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Place } from "@/models/Place";

// POST /api/places/[id]/tips
// Body: { tip: string } to add, or { summarize: true } to get AI summary
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();
    const place = await Place.findById(params.id);

    if (!place) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }

    // If summarize request
    if (body.summarize) {
      if (place.tips.length < 2) {
        return NextResponse.json({
          success: true,
          data: { summary: place.tips.join(". ") },
        });
      }

      const summary = await summarizeTips(place.tips, place.name);
      return NextResponse.json({ success: true, data: { summary } });
    }

    // Otherwise, add a new tip
    const { tip } = body;
    if (!tip || !tip.trim()) {
      return NextResponse.json(
        { success: false, error: "tip is required" },
        { status: 400 }
      );
    }

    if (place.tips.length >= 50) {
      return NextResponse.json(
        { success: false, error: "Maximum 50 tips per place" },
        { status: 400 }
      );
    }

    place.tips.push(tip.trim());
    await place.save();

    return NextResponse.json({
      success: true,
      data: { tips: place.tips },
    });
  } catch (error) {
    console.error("POST /api/places/[id]/tips error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process tips" },
      { status: 500 }
    );
  }
}

async function summarizeTips(tips: string[], placeName: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback: basic client-side dedup
    const unique = [...new Set(tips.map((t) => t.toLowerCase()))];
    return unique
      .slice(0, 4)
      .map((t) => `• ${t.charAt(0).toUpperCase() + t.slice(1)}`)
      .join("\n");
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `You are summarizing community tips about "${placeName}" in Bangalore, India. Merge similar tips, remove duplicates, and create a concise, helpful summary that a visitor would find useful. Keep the local flavor and specific details. Return 2-4 bullet points max, each starting with "•".\n\nTips from visitors:\n${tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text || tips.slice(0, 4).join("\n• ");
  } catch (error) {
    console.error("AI summarization failed:", error);
    const unique = [...new Set(tips.map((t) => t.toLowerCase()))];
    return unique
      .slice(0, 4)
      .map((t) => `• ${t.charAt(0).toUpperCase() + t.slice(1)}`)
      .join("\n");
  }
}
