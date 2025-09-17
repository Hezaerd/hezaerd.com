import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
        reactCompiler: true,
        optimizePackageImports: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-progress',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            'sonner',
            'motion',
        ]
    }
};

export default nextConfig;
