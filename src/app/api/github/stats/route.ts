import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const username = "hezaerd"; // Your GitHub username

  try {
    // Fetch user profile data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      console.error(`Failed to fetch user data: ${userResponse.status}`);
      return new Response("Failed to fetch GitHub stats", { status: 500 });
    }

    const userData = await userResponse.json();

    // Fetch repositories for additional stats
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!reposResponse.ok) {
      console.error(`Failed to fetch repos: ${reposResponse.status}`);
      return new Response("Failed to fetch GitHub stats", { status: 500 });
    }

    const reposData = await reposResponse.json();

    // Calculate additional stats from repositories
    const totalStars = reposData.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
    const totalForks = reposData.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);
    // Note: GitHub REST API does not provide all-time commit count directly.
    // We'll use the total contributions from the contribution graph (last 365 days) as a proxy for yearly commits.
    // const totalCommits = reposData.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0); // incorrect

    // Get top languages
    const languages: { [key: string]: number } = {};
    reposData.forEach((repo: any) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([language, count]) => ({ language, count }));

    // Fetch contribution graph data (last 365 days)
    const contributionResponse = await fetch(
      `https://api.github.com/graphql`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{
            user(login: "${username}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }`
        }),
      }
    );

    let contributionData = null;
    if (contributionResponse.ok) {
      const contributionResult = await contributionResponse.json();
      contributionData = contributionResult.data?.user?.contributionsCollection?.contributionCalendar;
    }

    const stats = {
      profile: {
        username: userData.login,
        name: userData.name,
        bio: userData.bio,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        location: userData.location,
        company: userData.company,
        blog: userData.blog,
        twitter_username: userData.twitter_username,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      },
      stats: {
        public_repos: userData.public_repos,
        public_gists: userData.public_gists,
        followers: userData.followers,
        following: userData.following,
        total_stars: totalStars,
        total_forks: totalForks,
        // This is the total number of contributions (commits, PRs, issues, etc.) in the last 365 days
        total_commits: contributionData?.totalContributions || 0,
      },
      top_languages: topLanguages,
      contribution_graph: contributionData,
    };

    return new Response(JSON.stringify(stats), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to fetch GitHub stats:", error);
    return new Response("Internal server error", { status: 500 });
  }
}