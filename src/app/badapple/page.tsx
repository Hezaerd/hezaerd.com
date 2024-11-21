import { redirect } from "next/navigation";
import { isSecretValid } from "@/lib/secrets";
import { BadAppleSecret } from "@/components/secrets/bad-apple";

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
      <BadAppleSecret />
    </div>
  );
}
