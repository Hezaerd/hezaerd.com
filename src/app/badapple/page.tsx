import { redirect } from "next/navigation";
import { isSecretValid } from "@/lib/secrets";
import { BadAppleSecret } from "@/components/secrets/bad-apple";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hezaerd - Bad Apple",
  description:
    "Internet is balanced around 3 pillars: Cats, Bad Apple and Rick Roll.",
  keywords: ["Hezaerd", "Bad Apple", "Eastergg"],
};

export default async function BadApplePage({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const searchParams = await rawSearchParams;
  const secret = searchParams.secret;

  if (!secret) {
    redirect("/"); // redirect to home if secret is not provided
  }

  if (!isSecretValid(secret)) {
    redirect("/"); // redirect to home if secret is invalid
  }

  return (
    <div className="h-screen w-screen pt-16">
      <BadAppleSecret />
    </div>
  );
}
