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
    async rewrites() {
        const configuredApi = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL;
        if (process.env.VERCEL === "1" && !configuredApi) {
            console.warn(
                "[NeurelPress] Set NEXT_PUBLIC_API_URL on Vercel to your backend public HTTPS URL ending in /api " +
                    "(never a private IP or localhost — Vercel cannot reach those)."
            );
        }
        const fallbackApi = process.env.NODE_ENV === "production"
            ? null
            : "http://127.0.0.1:8080/api";
        const apiBase = configuredApi || fallbackApi;

        if (!apiBase) {
            return [];
        }

        const backendOrigin = apiBase.replace(/\/api\/?$/, "");

        return [
            {
                source: "/api/:path*",
                destination: `${backendOrigin}/api/:path*`,
            },
            {
                source: "/oauth2/:path*",
                destination: `${backendOrigin}/oauth2/:path*`,
            },
            {
                source: "/login/oauth2/:path*",
                destination: `${backendOrigin}/login/oauth2/:path*`,
            },
        ];
    },
};

const withMDX = createMDX({
    // Keep MDX enabled with default compiler options.
    // Turbopack in Next 16 requires loader options to be serializable,
    // and direct plugin function references break dev startup.
    options: {},
});

export default withMDX(nextConfig);
