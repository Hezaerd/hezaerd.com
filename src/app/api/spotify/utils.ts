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

  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  // Check for specific error types
  let userFriendlyMessage = `Failed to fetch ${context}`;
  let responseStatus = status;

  // Handle credential errors with more specific messages and appropriate status code
  if (errorMessage.includes("Missing Spotify credentials")) {
    userFriendlyMessage = "Spotify integration is not properly configured. Missing API credentials.";
    responseStatus = 503; // Service Unavailable
  } else if (errorMessage.includes("Failed to get access token")) {
    userFriendlyMessage = "Unable to authenticate with Spotify. Please check API credentials.";
    responseStatus = 401; // Unauthorized
  }

  // Return a user-friendly error response
  return NextResponse.json(
    {
      error: userFriendlyMessage,
      details: errorMessage,
    },
    {
      status: responseStatus,
      headers: NO_CACHE_HEADERS,
    },
  );
}
