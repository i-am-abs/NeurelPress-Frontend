import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    images: {
        remotePatterns: [
            {protocol: 'https', hostname: '**.googleusercontent.com'},
            {protocol: 'https', hostname: '**.githubusercontent.com'},
            {protocol: 'https', hostname: 'assets.neuralpress.dev'},
            {protocol: 'https', hostname: 'miro.medium.com'},
            // dev.to dynamic images (covers etc.)
            {protocol: 'https', hostname: 'media2.dev.to'},
            // Fallback for direct S3-hosted dev.to assets if needed
            {protocol: 'https', hostname: 'dev-to-uploads.s3.amazonaws.com'},
        ],
    },
    experimental: {
        optimizePackageImports: ['framer-motion', 'react-icons', 'date-fns'],
    },
};

const withMDX = createMDX({
    // Keep MDX enabled with default compiler options.
    // Turbopack in Next 16 requires loader options to be serializable,
    // and direct plugin function references break dev startup.
    options: {},
});

export default withMDX(nextConfig);
