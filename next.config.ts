import type { NextConfig } from "next";

type EnvConfig = {
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
};

const nextConfig: NextConfig = {
  env: {
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID || "",
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN || "",
  } as EnvConfig,
};

export default nextConfig;