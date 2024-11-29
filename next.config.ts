import { NextConfig } from "next";
import MillionLint from "@million/lint";

const config: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        port: "",
      },
      {
        protocol: "https",
        hostname: "shared.akamai.steamstatic.com",
        port: "",
      },
    ],
  },
};

export default MillionLint.next({ rsc: true })(config);
