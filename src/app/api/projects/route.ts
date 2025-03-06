import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const perPage = "6"; // We need at least 6 repos total

  // Fetch starred repos
  const starredUrl = `https://api.github.com/user/repos?type=public&sort=stars&direction=desc&per_page=${perPage}`;
  const recentUrl = `https://api.github.com/user/repos?type=public&sort=pushed&direction=desc&per_page=${perPage}`;

  try {
    const [starredResponse, recentResponse] = await Promise.all([
      fetch(starredUrl, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }),
      fetch(recentUrl, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }),
    ]);

    if (!starredResponse.ok || !recentResponse.ok) {
      console.error(
        `Failed to fetch projects: Starred(${starredResponse.status}), Recent(${recentResponse.status})`,
      );
      console.error(`URLs: ${starredUrl}, ${recentUrl}`);
      try {
        const errorData = await (
          !starredResponse.ok ? starredResponse : recentResponse
        ).json();
        console.error("Error response body:", errorData);
      } catch (e) {
        console.error("Failed to parse error response body:", e);
      }
      return new Response("Failed to fetch projects", { status: 500 });
    }

    const [starredData, recentData] = await Promise.all([
      starredResponse.json(),
      recentResponse.json(),
    ]);

    // Take top 3 from each
    const topStarred = starredData.slice(0, 3);
    const topRecent = recentData
      .filter(
        (repo: any) =>
          !topStarred.some((starred: any) => starred.id === repo.id),
      )
      .slice(0, 3);

    return new Response(
      JSON.stringify({
        starred: topStarred,
        recent: topRecent,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
