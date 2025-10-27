import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    experimental: {
        turbopackFileSystemCacheForDev: true,
        turbopackFileSystemCacheForBuild: true,
    }
};

export default nextConfig;
