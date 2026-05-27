import {ArticlePageContent} from "@/components/article/article-page-content";
import type {Metadata} from "next";

interface ArticlePageProps {
    params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({params}: ArticlePageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

    try {
        const res = await fetch(`${apiUrl}/articles/${resolvedParams.slug}`, {
            next: {revalidate: 60},
        });
        if (!res.ok) return {title: "Article Not Found"};

        const article = await res.json();
        const username = resolvedParams.username.replace("%40", "");

        return {
            title: article.seoTitle || article.title,
            description: article.seoDescription || article.summary,
            openGraph: {
                title: article.seoTitle || article.title,
                description: article.seoDescription || article.summary || "",
                type: "article",
                publishedTime: article.publishedAt,
                authors: [article.author?.displayName],
                url: `https://neuralpress.dev/u/${username}/${article.slug}`,
                images: article.coverImage ? [{url: article.coverImage}] : [],
            },
            twitter: {
                card: "summary_large_image",
                title: article.seoTitle || article.title,
                description: article.seoDescription || article.summary || "",
                images: article.coverImage ? [article.coverImage] : [],
            },
            alternates: {
                canonical: article.canonicalUrl || `https://neuralpress.dev/u/${username}/${article.slug}`,
            },
            other: {
                "article:published_time": article.publishedAt || "",
                "article:author": article.author?.displayName || "",
            },
        };
    } catch {
        return {title: "NeuralPress Article"};
    }
}

export default async function ArticlePage({params}: ArticlePageProps) {
    const resolvedParams = await params;
    return <ArticlePageContent slug={resolvedParams.slug}/>;
}
