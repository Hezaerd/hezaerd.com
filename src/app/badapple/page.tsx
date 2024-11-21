import { redirect } from "next/navigation";
import { isSecretValid } from "../api/bad-apple/generate-secret/route";
import { red } from "tailwindcss/colors";

export default async function BadApplePage({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const searchParams = await rawSearchParams;
  const secret = searchParams.secret;

  if (!secret || !isSecretValid(secret)) {
    redirect("/"); // redirect to home if secret is invalid
  }

  return (
    <div className="h-screen w-screen pt-16">
      <video
        src="videos/bad_apple.mov"
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
}
