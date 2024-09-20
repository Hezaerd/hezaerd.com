import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type: string = searchParams.get("type") || "all";
  const sort = searchParams.get("sort") || "pushed";
  const perPage = searchParams.get("per_page") || "5";
  const page = searchParams.get("page") || "1";

  const url = `https://api.github.com/user/repos?type=${type}&sort=${sort}&per_page=${perPage}&page=${page}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  if (!response.ok) {
    return new Response("Failed to fetch projects", { status: 500 });
  }

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
