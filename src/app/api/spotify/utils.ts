import { NextResponse } from "next/server";

/**
 * Headers that prevent caching of responses
 */
export const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * Creates a standard success response with proper headers
 *
 * @param data - The data to return in the response
 * @returns A standardized NextResponse
 */
export function createSuccessResponse<T>(data: T) {
  return NextResponse.json(data, {
    status: 200,
    headers: NO_CACHE_HEADERS,
  });
}

/**
 * Creates a standard error response
 *
 * @param error - The error that occurred
 * @param context - Context description for the error message
 * @param status - HTTP status code (default: 500)
 * @returns A standardized error response
 */
export function createErrorResponse(
  error: unknown,
  context: string,
  status = 500,
) {
  // Log the error with context for server-side debugging
  console.error(`Error in Spotify API (${context}):`, error);

  // Return a user-friendly error response
  return NextResponse.json(
    {
      error: `Failed to fetch ${context}`,
      details: error instanceof Error ? error.message : "Unknown error",
    },
    {
      status,
      headers: NO_CACHE_HEADERS,
    },
  );
}
