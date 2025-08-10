
import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default isProd
  ? nextPWA({
      dest: "public",
      register: true,
      skipWaiting: true,
    })(nextConfig)
  : nextConfig;
