import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const perPage = "6"; // We need at least 6 repos total

  // GraphQL query to fetch pinned repositories with topics
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
            repositoryTopics(first: 10) {
              nodes {
                topic {
                  name
                }
              }
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

    // Helper function to categorize repositories based on topics and language
    const categorizeRepository = (repo: any) => {
      const categories: string[] = [];
      const topics = repo.repositoryTopics?.nodes?.map((node: any) => node.topic.name) || [];
      const language = repo.primaryLanguage?.name || "";

      // Categorize based on topics
      if (topics.includes("web") || topics.includes("frontend") || topics.includes("react") || topics.includes("nextjs")) {
        categories.push("Web Development");
      }
      if (topics.includes("mobile") || topics.includes("flutter") || topics.includes("react-native")) {
        categories.push("Mobile");
      }
      if (topics.includes("game") || topics.includes("unity") || topics.includes("unreal")) {
        categories.push("Game Development");
      }
      if (topics.includes("ai") || topics.includes("ml") || topics.includes("machine-learning")) {
        categories.push("AI/ML");
      }
      if (topics.includes("data") || topics.includes("analytics") || topics.includes("visualization")) {
        categories.push("Data Science");
      }
      if (topics.includes("devops") || topics.includes("docker") || topics.includes("kubernetes")) {
        categories.push("DevOps");
      }
      if (topics.includes("fullstack") || topics.includes("backend") || topics.includes("api")) {
        categories.push("Full Stack");
      }

      // Categorize based on language
      if (language === "C#" && !categories.includes("Game Development")) {
        categories.push("Game Development");
      }
      if (language === "Dart" && !categories.includes("Mobile")) {
        categories.push("Mobile");
      }
      if (language === "Python" && !categories.includes("Data Science")) {
        categories.push("Data Science");
      }

      // Default category if none found
      if (categories.length === 0) {
        categories.push("Web Development");
      }

      return categories;
    };

    const topPinned = pinnedData.data.viewer.pinnedItems.nodes.map(
      (repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.url,
        stargazers_count: repo.stargazerCount,
        forks_count: repo.forkCount,
        language: repo.primaryLanguage?.name || "",
        categories: categorizeRepository(repo),
      }),
    );

    const topRecent = recentData
      .filter(
        (repo: any) => !topPinned.some((pinned: any) => pinned.id === repo.id),
      )
      .slice(0, 3)
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language || "",
        categories: categorizeRepository(repo),
      }));

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
