import { NextRequest, NextResponse } from "next/server";
import { recentlyPlayed } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const data = await recentlyPlayed();

  return NextResponse.json(data);
}
