import type {MetadataRoute} from "next";

const getBaseUrl = () =>
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const BASE_URL = getBaseUrl();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

    const staticPages: MetadataRoute.Sitemap = [
        {url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0},
        {url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9},
        {url: `${BASE_URL}/library`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8},
    ];

    try {
        const articlesRes = await fetch(`${apiUrl}/articles?page=0&size=100`, {
            next: {revalidate: 3600},
        });
        if (articlesRes.ok) {
            const data = await articlesRes.json();
            const articlePages: MetadataRoute.Sitemap = data.content.map((article: {
                author: { username: string };
                slug: string;
                updatedAt?: string;
                publishedAt?: string
            }) => ({
                url: `${BASE_URL}/u/${article.author.username}/${article.slug}`,
                lastModified: new Date(article.updatedAt || article.publishedAt || Date.now()),
                changeFrequency: "weekly" as const,
                priority: 0.7,
            }));
            staticPages.push(...articlePages);
        }
    } catch {
        console.log("Error fetching articles from sitemap");
    }

    // Fetch tags for tag sitemap
    try {
        const tagsRes = await fetch(`${apiUrl}/tags`, {next: {revalidate: 86400}});
        if (tagsRes.ok) {
            const tags = await tagsRes.json();
            const tagPages: MetadataRoute.Sitemap = tags.map((tag: { slug: string }) => ({
                url: `${BASE_URL}/tag/${tag.slug}`,
                changeFrequency: "weekly" as const,
                priority: 0.6,
            }));
            staticPages.push(...tagPages);
        }
    } catch {
        console.log("Error fetching tags from sitemap");
    }

    return staticPages;
}
