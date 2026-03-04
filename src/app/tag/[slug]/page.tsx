import {TagPageContent} from "./tag-page-content";
import type {Metadata} from "next";

interface TagPageProps {
    params: { slug: string };
}

export async function generateMetadata({params}: TagPageProps): Promise<Metadata> {
    const tagName = params.slug
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

export default function TagPage({params}: TagPageProps) {
    return <TagPageContent slug={params.slug}/>;
}
