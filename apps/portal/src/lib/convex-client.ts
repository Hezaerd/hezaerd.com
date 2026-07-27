import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

export const convex =
  typeof convexUrl === "string" && convexUrl.length > 0 ? new ConvexReactClient(convexUrl) : null;
