/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return config;
  },
};

module.exports = nextConfig;
