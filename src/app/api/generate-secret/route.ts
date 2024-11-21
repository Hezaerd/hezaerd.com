import { NextResponse } from "next/server";
import { generateSecret } from "@/lib/secrets";

export async function GET() {
  return NextResponse.json({ secret: generateSecret() });
}
