import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Static HTML only: this app is a frontend. With `export`, the build FAILS if someone adds
  // route handlers or server actions, so no backend can sneak into Next.
  output: "export",
  // /en/ -> en/index.html. Works on any static host without rewrite rules (/en -> en.html would not).
  trailingSlash: true,
  // Shared packages are TypeScript source (no build step): Next must compile them.
  transpilePackages: ["@repo/lib", "@repo/ui"],
  // Next 16 writes an AGENTS.md into the app folder on `dev`. Our agent docs live in /docs.
  agentRules: false,
};

export default withNextIntl(nextConfig);
