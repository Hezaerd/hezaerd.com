import { currentPlaying } from "@/lib/spotify";
import { createSuccessResponse, createErrorResponse } from "../utils";

/**
 * GET handler for /api/spotify/currently-playing
 * Fetches the current user's currently playing track from Spotify
 *
 * @returns JSON response with currently playing track or null
 */
export async function GET() {
  try {
    const data = await currentPlaying();
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(error, "currently playing track");
  }
}