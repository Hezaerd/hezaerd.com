import { NextRequest } from "next/server";
import { currentPlaying } from "@/lib/spotify";
import { createSuccessResponse, createErrorResponse } from "../utils";

/**
 * GET handler for /api/spotify/now-playing
 * Fetches the user's currently playing track from Spotify
 *
 * @param req - The incoming request object
 * @returns JSON response with currently playing track (or null) or error
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch currently playing track from Spotify API
    const data = await currentPlaying();

    // Return successful response (data may be null if nothing is playing)
    return createSuccessResponse({ isPlaying: !!data, track: data });
  } catch (error) {
    // Return appropriate error response
    return createErrorResponse(error, "currently playing track");
  }
}
