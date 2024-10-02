import { NextRequest, NextResponse } from "next/server";
import { topArtists } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const data = await topArtists();

  return NextResponse.json(data);
}
