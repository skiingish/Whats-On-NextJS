/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const withPWA = require('next-pwa');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = withBundleAnalyzer(
  withPWA({
    pageExtensions: ['tsx'],
    pwa: {
      disable: !isProd,
      dest: 'public',
    },
  })
);

// const nextConfig = {
//   experimental: {
//     serverActions: true,
//   },
// };

// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
// });

// module.exports = withPWA({
//   reactStrictMode: true,
// });

module.exports = nextConfig;
