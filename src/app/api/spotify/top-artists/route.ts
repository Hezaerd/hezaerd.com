import { NextRequest, NextResponse } from "next/server";
import { topArtists } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  try {
    console.log("Received request for top artists");
    const data = await topArtists();
    console.log("Fetched top artists data");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching top artists data:", error);
    return NextResponse.json(
      { error: "Failed to fetch top artists data" },
      { status: 500 },
    );
  }
}
