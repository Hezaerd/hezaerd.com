import { createFileRoute } from "@tanstack/react-router";

import { NotFound, notFoundTitle } from "@/not-found";
import { seo } from "@/seo";

export const Route = createFileRoute("/404")({
  head: () => seo({ title: notFoundTitle, description: "This page doesn't exist.", path: "/404" }),
  component: NotFound,
});
