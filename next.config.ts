import type { NextConfig } from "next";

// Import bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
    experimental: {
        reactCompiler: true,
        optimizePackageImports: [
            'lucide-react',
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
    }
};

// Export the config wrapped with bundle analyzer
export default withBundleAnalyzer(nextConfig);
