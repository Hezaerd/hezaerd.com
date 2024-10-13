import { NextRequest, NextResponse } from "next/server";
import { recentlyPlayed } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  try {
    console.log("Fetching recently played tracks...");

    const data = await recentlyPlayed();

    console.log("Successfully fetched recently played tracks:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching recently played tracks", error);

    return NextResponse.json(
      { error: error || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
