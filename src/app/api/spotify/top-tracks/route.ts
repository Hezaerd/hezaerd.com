import { NextRequest } from "next/server";
import { topTracks } from "@/lib/spotify";
import { createSuccessResponse, createErrorResponse } from "../utils";

/**
 * GET handler for /api/spotify/top-tracks
 * Fetches the current user's top tracks from Spotify
 *
 * @param req - The incoming request object
 * @returns JSON response with top tracks or error
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch top tracks from Spotify API
    const data = await topTracks();

    // Return successful response without caching to ensure fresh data
    return createSuccessResponse(data);
  } catch (error) {
    // Return appropriate error response
    return createErrorResponse(error, "top tracks");
  }
}
