import {TagPageContent} from "./tag-page-content";
import type {Metadata} from "next";

interface TagPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({params}: TagPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const tagName = resolvedParams.slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
        title: `${tagName} Articles`,
        description: `Browse all articles tagged with ${tagName} on NeuralPress.`,
        openGraph: {
            title: `${tagName} Articles | NeuralPress`,
            description: `Browse all articles tagged with ${tagName}.`,
        },
    };
}

export default async function TagPage({params}: TagPageProps) {
    const resolvedParams = await params;
    return <TagPageContent slug={resolvedParams.slug}/>;
}
