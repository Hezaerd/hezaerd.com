import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next";

export function Analytics() {
  return (
    <>
      <GoogleAnalytics gaId="G-ZBGGWW1HXC" />
      <VercelAnalytics />
      <VercelSpeedInsights />
    </>
  );
}
