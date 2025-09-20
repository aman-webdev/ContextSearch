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
  output: 'standalone'
};

export default nextConfig;
