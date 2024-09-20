import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-center text-lg">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>

      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
}
