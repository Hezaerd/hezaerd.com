import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/project/$slugs')({
  component: RouteComponent,
})

function RouteComponent() {
  const { slugs } = useParams({ from: '/project/$slugs' });

  return <div>Hello project {slugs}!</div>
}
