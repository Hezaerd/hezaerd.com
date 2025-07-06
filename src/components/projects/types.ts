export interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count?: number;
  forks_count?: number;
  thumbnail?: string;
  categories?: string[];
  featured?: boolean;
}
