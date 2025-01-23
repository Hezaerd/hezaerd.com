import { NextRequest, NextResponse } from "next/server";
import { recentlyPlayed } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  try {
    const data = await recentlyPlayed();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching recently played tracks", error);

    return NextResponse.json(
      { error: error || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
