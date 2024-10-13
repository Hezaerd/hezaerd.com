import { NextRequest, NextResponse } from "next/server";
import { recentlyPlayed } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  try {
    console.log("Received request:", req);
    const data = await recentlyPlayed();
    console.log("Fetched recently played data:");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching recently played data:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently played data" },
      { status: 500 },
    );
  }
}
