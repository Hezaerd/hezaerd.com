/**
 * Enhanced fetcher for SWR that properly handles errors
 *
 * @param url The URL to fetch
 * @returns The parsed JSON response
 * @throws Error with proper message when request fails
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    // First try to get structured error from response
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          errorData.message ||
          `Failed with status: ${response.status}`,
      );
    } catch (parseError) {
      // If we can't parse the error JSON, use status text
      throw new Error(
        `Failed with status: ${response.status} ${response.statusText}`,
      );
    }
  }

  return response.json();
};

/**
 * Configuration options for SWR fetching
 */
export const SWR_CONFIG = {
  // Only revalidate when window regains focus to prevent unnecessary fetches
  revalidateOnFocus: true,

  // Don't automatically revalidate data on interval in the background
  // This is important for Spotify API to avoid rate limiting
  refreshInterval: 0,

  // Keep stale data when revalidation is happening
  keepPreviousData: true,

  // Retry on failure, but not too many times
  errorRetryCount: 3,

  // Dedupe requests within a given window
  dedupingInterval: 10000, // 10 seconds
};

/**
 * Configuration for data that should reload more frequently
 */
export const SWR_CONFIG_FREQUENT = {
  ...SWR_CONFIG,
  // For now-playing, we want to check more frequently
  refreshInterval: 30000, // 30 seconds
  // Don't flash errors for now-playing
  shouldRetryOnError: true,
};
