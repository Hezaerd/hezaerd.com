import { NextRequest, NextResponse } from "next/server";
import { topTracks } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const data = await topTracks();

  return NextResponse.json(data);
}
