export interface GitHubProfile {
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  location: string;
  company: string;
  blog: string;
  twitter_username: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubStats {
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  total_stars: number;
  total_forks: number;
  total_commits: number;
}

export interface TopLanguage {
  language: string;
  count: number;
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionGraph {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface GitHubData {
  profile: GitHubProfile;
  stats: GitHubStats;
  top_languages: TopLanguage[];
  contribution_graph: ContributionGraph | null;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  license?: {
    name: string;
    spdx_id: string;
  };
  topics: string[];
}