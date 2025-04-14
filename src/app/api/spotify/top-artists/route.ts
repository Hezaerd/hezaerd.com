import { NextRequest } from "next/server";
import { topArtists, TimeRange } from "@/lib/spotify";
import { createSuccessResponse, createErrorResponse } from "../utils";

/**
 * GET handler for /api/spotify/top-artists
 * Fetches the current user's top artists from Spotify
 *
 * @param req - The incoming request object
 * @returns JSON response with top artists or error
 */
export async function GET(req: NextRequest) {
  try {
    // Get time range from query params (default to medium_term if not specified)
    const url = new URL(req.url);
    const timeRange = url.searchParams.get("time_range") as TimeRange || "medium_term";

    // Fetch top artists from Spotify API with the specified time range
    const data = await topArtists(timeRange);

    // Return successful response without caching to ensure fresh data
    return createSuccessResponse(data);
  } catch (error) {
    // Return appropriate error response
    return createErrorResponse(error, "top artists");
  }
}
