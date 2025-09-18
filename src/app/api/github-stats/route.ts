import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const username = "hezaerd";

	try {
		// Fetch user profile data
		const userResponse = await fetch(
			`https://api.github.com/users/${username}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!userResponse.ok) {
			console.error(`Failed to fetch user data: ${userResponse.status}`);
			return new Response("Failed to fetch GitHub stats", { status: 500 });
		}

		const userData = await userResponse.json();

		// Fetch recent push events to get latest activity
		const eventsResponse = await fetch(
			`https://api.github.com/users/${username}/events?per_page=100`,
			{
				headers: {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!eventsResponse.ok) {
			console.error(`Failed to fetch events: ${eventsResponse.status}`);
			return new Response("Failed to fetch GitHub stats", { status: 500 });
		}

		const eventsData = await eventsResponse.json();

		// Extract unique repositories from recent push events
		const recentRepoNames = new Set<string>();
		eventsData
			.filter((event: any) => event.type === "PushEvent")
			.forEach((event: any) => {
				if (event.repo?.name) {
					recentRepoNames.add(event.repo.name);
				}
			});

		// Fetch repositories for additional stats (all repos for language stats)
		const reposResponse = await fetch(
			`https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=all`,
			{
				headers: {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!reposResponse.ok) {
			console.error(`Failed to fetch repos: ${reposResponse.status}`);
			return new Response("Failed to fetch GitHub stats", { status: 500 });
		}

		const reposData = await reposResponse.json();

		// Filter out forks and archived repos for language stats
		const publicRepos = reposData.filter(
			(repo: any) => !repo.fork && !repo.archived,
		);

		// Get detailed info for recent repositories from events
		const recentRepos: any[] = [];
		const recentRepoNamesArray = Array.from(recentRepoNames).slice(0, 10); // Limit to 10 recent repos

		for (const repoName of recentRepoNamesArray) {
			try {
				const repoResponse = await fetch(
					`https://api.github.com/repos/${repoName}`,
					{
						headers: {
							Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
							"Content-Type": "application/json",
						},
					},
				);

				if (repoResponse.ok) {
					const repoData = await repoResponse.json();
					recentRepos.push(repoData);
				}
			} catch (error) {
				console.warn(`Failed to fetch repo details for ${repoName}:`, error);
			}
		}

		// Remove duplicates based on repository ID and sort by last push date
		const uniqueRecentRepos = recentRepos
			.filter(
				(repo, index, self) =>
					index === self.findIndex((r) => r.id === repo.id),
			)
			.sort(
				(a: any, b: any) =>
					new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
			);

		// Calculate additional stats from repositories
		const totalStars = publicRepos.reduce(
			(sum: number, repo: any) => sum + repo.stargazers_count,
			0,
		);
		const totalForks = publicRepos.reduce(
			(sum: number, repo: any) => sum + repo.forks_count,
			0,
		);

		// Get top languages (count by repository usage, not bytes)
		const languages: { [key: string]: number } = {};
		publicRepos.forEach((repo: any) => {
			if (repo.language) {
				languages[repo.language] = (languages[repo.language] || 0) + 1;
			}
		});

		const topLanguages = Object.entries(languages)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([language, count]) => ({ language, count }));

		// Fetch contribution graph data (last 365 days) using GraphQL
		const contributionResponse = await fetch(`https://api.github.com/graphql`, {
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
          }`,
			}),
		});

		let contributionData = null;
		if (contributionResponse.ok) {
			const contributionResult = await contributionResponse.json();
			contributionData =
				contributionResult.data?.user?.contributionsCollection
					?.contributionCalendar;
		}

		// Transform contribution data to match your existing types
		const transformedContributions = contributionData
			? {
					totalContributions: contributionData.totalContributions,
					weeks: contributionData.weeks.map((week: any) => ({
						contributionDays: week.contributionDays.map((day: any) => {
							let level: 0 | 1 | 2 | 3 | 4 = 0;
							if (day.contributionCount > 0) level = 1;
							if (day.contributionCount > 3) level = 2;
							if (day.contributionCount > 6) level = 3;
							if (day.contributionCount > 9) level = 4;

							return {
								date: day.date,
								count: day.contributionCount,
								level,
							};
						}),
						firstDay: week.contributionDays[0]?.date || "",
					})),
					fromYear: new Date().getFullYear() - 1,
					toYear: new Date().getFullYear(),
				}
			: null;

		// Prepare language stats (convert count to bytes-like format for compatibility)
		const languageStats: { [key: string]: number } = {};
		topLanguages.forEach(({ language, count }) => {
			languageStats[language] = count * 1000; // Multiply by 1000 to simulate bytes
		});

		const stats = {
			user: {
				login: userData.login,
				name: userData.name,
				avatar_url: userData.avatar_url,
				bio: userData.bio,
				location: userData.location,
				email: userData.email,
				public_repos: userData.public_repos,
				public_gists: userData.public_gists,
				followers: userData.followers,
				following: userData.following,
				created_at: userData.created_at,
				updated_at: userData.updated_at,
			},
			topRepositories: uniqueRecentRepos.slice(0, 6).map((repo: any) => ({
				id: repo.id,
				name: repo.name,
				full_name: repo.full_name,
				description: repo.description,
				html_url: repo.html_url,
				language: repo.language,
				stargazers_count: repo.stargazers_count,
				watchers_count: repo.watchers_count,
				forks_count: repo.forks_count,
				size: repo.size,
				created_at: repo.created_at,
				updated_at: repo.updated_at,
				pushed_at: repo.pushed_at,
				topics: repo.topics || [],
				archived: repo.archived,
				fork: repo.fork,
			})),
			totalStars,
			favoriteLanguage: topLanguages[0]?.language || null,
			languageStats,
			contributions: transformedContributions || {
				totalContributions: 0,
				weeks: [],
				fromYear: new Date().getFullYear() - 1,
				toYear: new Date().getFullYear(),
			},
			lastUpdated: new Date().toISOString(),
		};

		return new Response(JSON.stringify({ success: true, data: stats }), {
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "s-maxage=300, stale-while-revalidate=600", // Cache for 5 minutes
			},
		});
	} catch (error) {
		console.error("Failed to fetch GitHub stats:", error);
		return new Response(
			JSON.stringify({ success: false, error: "Internal server error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
