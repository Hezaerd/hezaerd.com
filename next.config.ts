import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	poweredByHeader: false,
	typedRoutes: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	experimental: {
		reactCompiler: true,
	},
};

export default nextConfig;
