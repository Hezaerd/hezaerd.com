interface ProjectItem {
  title: string;
  description: string;
  header: React.ReactNode;
  className: string;
  icon: React.ReactNode;
  html_url?: string;
}

async function getLatestProjects() {
  // api/projects
  const response = await fetch("/api/projects");

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}

export { type ProjectItem, getLatestProjects };
