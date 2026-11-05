const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `yarn build` runs `tsc --noEmit` before `next build`, so type errors still
  // fail the build. Running it inside `next build` alongside webpack's heap ran
  // Vercel's 8 GB build machine out of memory.
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      net: false,
      tls: false,
      fs: false,
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      stream: require.resolve("stream-browserify"),
      child_process: false, // Disable 'child_process'
    };
    // React Native-only optional dependency of @metamask/sdk; not needed on web.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };
    // ox's Tempo miner dynamically imports node:worker_threads (Node-only path).
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /node_modules[\\/](viem[\\/]node_modules[\\/])?ox[\\/]_esm[\\/]tempo[\\/]/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.

    // Suppresses source map uploading logs during build
    silent: true,
    // Source maps were generated for every bundle but can't be uploaded (org and
    // project below are placeholders), and generating them pushed the build past
    // Vercel's 8 GB limit. Re-enable once Sentry uploads are configured.
    sourcemaps: { disable: true },
    org: "your-org-name",
    project: "your-project-name",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
