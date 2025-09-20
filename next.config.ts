import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@langchain/community',
    '@langchain/core',
    '@langchain/openai',
    '@langchain/qdrant',
    '@langchain/textsplitters',
    'langchain',
    'pdf-parse',
    'jsdom',
    'html-to-text',
    '@prisma/client'
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        'canvas',
        'sharp',
        'onnxruntime-node'
      ];
    }
    return config;
  },
  output: 'standalone',
  outputFileTracingExcludes: {
    '/*': [
      '.pnpm-store/**/*',
      'node_modules/.pnpm/**/*',
      '.pnpm/**/*',
      '**/node_modules/.pnpm/**/*',
    ],
    '/api/*': [
      '.pnpm-store/**/*',
      'node_modules/.pnpm/**/*',
      '.pnpm/**/*',
      'lib/generated/prisma/libquery_engine-darwin-arm64.dylib.node',
      'lib/generated/prisma/query_engine_bg.wasm'
    ]
  }
};

export default nextConfig;
