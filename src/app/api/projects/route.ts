import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const perPage = "6"; // We need at least 6 repos total

  // GraphQL query to fetch pinned repositories
  const query = `{
    viewer {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            id
            name
            description
            url
            stargazerCount
            forkCount
            primaryLanguage {
              name
            }
          }
        }
      }
    }
  }`;

  const recentUrl = `https://api.github.com/user/repos?type=public&sort=pushed&direction=desc&per_page=${perPage}`;

  try {
    const [pinnedResponse, recentResponse] = await Promise.all([
      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }),
      fetch(recentUrl, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }),
    ]);

    if (!pinnedResponse.ok || !recentResponse.ok) {
      console.error(
        `Failed to fetch projects: Pinned(${pinnedResponse.status}), Recent(${recentResponse.status})`,
      );
      console.error(`GraphQL query: ${query}`);
      console.error(`Recent URL: ${recentUrl}`);
      try {
        const errorData = await (
          !pinnedResponse.ok ? pinnedResponse : recentResponse
        ).json();
        console.error("Error response body:", errorData);
      } catch (e) {
        console.error("Failed to parse error response body:", e);
      }
      return new Response("Failed to fetch projects", { status: 500 });
    }

    const [pinnedData, recentData] = await Promise.all([
      pinnedResponse.json(),
      recentResponse.json(),
    ]);

    const topPinned = pinnedData.data.viewer.pinnedItems.nodes.map(
      (repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.url,
        stargazers_count: repo.stargazerCount,
        forks_count: repo.forkCount,
        language: repo.primaryLanguage?.name || "",
      }),
    );

    const topRecent = recentData
      .filter(
        (repo: any) => !topPinned.some((pinned: any) => pinned.id === repo.id),
      )
      .slice(0, 3);

    return new Response(
      JSON.stringify({
        pinned: topPinned,
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
