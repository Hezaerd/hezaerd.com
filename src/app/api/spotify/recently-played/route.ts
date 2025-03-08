import { NextRequest } from "next/server";
import { recentlyPlayed } from "@/lib/spotify";
import { createSuccessResponse, createErrorResponse } from "../utils";

/**
 * GET handler for /api/spotify/recently-played
 * Fetches the current user's recently played tracks from Spotify
 *
 * @param req - The incoming request object
 * @returns JSON response with recently played tracks or error
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch recently played tracks from Spotify API
    const data = await recentlyPlayed();

    // Return successful response without caching to ensure fresh data
    return createSuccessResponse(data);
  } catch (error) {
    // Return appropriate error response
    return createErrorResponse(error, "recently played tracks");
  }
}
