export interface OGImageOptions {
  title?: string;
  description?: string;
}

export function generateOGImageUrl(options: OGImageOptions = {}): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const params = new URLSearchParams();

  if (options.title) {
    params.set('title', options.title);
  }

  if (options.description) {
    params.set('description', options.description);
  }

  const queryString = params.toString();
  return `${baseUrl}/api/og${queryString ? `?${queryString}` : ''}`;
}

export function generateDefaultOGImageUrl(): string {
  return generateOGImageUrl({
    title: 'Software Engineer',
    description: 'Crafting high-performance experiences with precision.'
  });
}
