import { NextRequest, NextResponse } from "next/server";
import { topTracks } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  try {
    console.log("Received request:", req);
    const data = await topTracks();
    console.log("Fetched top tracks data");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch top tracks" },
      { status: 500 },
    );
  }
}
