import type { NextConfig } from "next";
import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
    experimental: {
        ppr: 'incremental',
        reactCompiler: true,
        optimizePackageImports: [
            'lucide-react',
            'react-icons',
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-progress',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            'sonner',
            'motion',
        ]
    },
    logging: {
        fetches: {
            fullUrl: true,
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.scdn.co",
                port: "",
            },
        ]
    }
};

export default withBundleAnalyzer(nextConfig);
