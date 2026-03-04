"use client";

import {useQuery, useQueryClient} from "@tanstack/react-query";
import {articleApi, bookmarkApi} from "@/lib/api";
import {useAuth} from "@/hooks/use-auth";
import {useReadingProgress} from "@/hooks/use-reading-progress";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Skeleton} from "@/components/ui/skeleton";
import {Separator} from "@/components/ui/separator";
import {ShareBar} from "@/components/article/share-bar";
import {TableOfContents} from "@/components/article/table-of-contents";
import Image from "next/image";
import Link from "next/link";
import {format} from "date-fns";
import {HiOutlineBookmark, HiOutlineHandThumbUp, HiOutlinePencilSquare} from "react-icons/hi2";
import toast from "react-hot-toast";
import {SITE_URL} from "@/lib/constants";

interface Props {
    slug: string;
}

export function ArticlePageContent({slug}: Props) {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const progress = useReadingProgress();

    const {data: article, isLoading} = useQuery({
        queryKey: ["article", slug],
        queryFn: () => articleApi.getBySlug(slug).then((r) => r.data),
    });

    const handleClap = async () => {
        if (!user) {
            toast.error("Sign in to clap");
            return;
        }
        try {
            await articleApi.clap(slug);
            await queryClient.invalidateQueries({queryKey: ["article", slug]});
            toast.success("Clapped!");
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 401) toast.error("Sign in to clap");
            else toast.error("Failed to clap");
        }
    };

    const handleBookmark = async () => {
        if (!user) {
            toast.error("Sign in to bookmark");
            return;
        }
        try {
            await bookmarkApi.toggle(slug);
            toast.success("Bookmark toggled");
        } catch {
            toast.error("Failed to bookmark");
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12">
                <Skeleton className="mb-4 h-10 w-3/4"/>
                <Skeleton className="mb-2 h-6 w-1/2"/>
                <Skeleton className="mb-8 h-64 w-full rounded-xl"/>
                <div className="space-y-4">
                    {Array.from({length: 8}).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full"/>
                    ))}
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Article not found.</p>
            </div>
        );
    }

    return (
        <>
            <div
                className="reading-progress"
                style={{width: `${progress}%`}}
            />

            <article className="mx-auto max-w-4xl px-4 py-12">
                {/* Header */}
                <header className="mb-8">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                            <Link key={tag.id} href={`/tag/${tag.slug}`}>
                                <Badge variant="secondary">{tag.name}</Badge>
                            </Link>
                        ))}
                    </div>

                    <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                        {article.title}
                    </h1>

                    {article.summary && (
                        <p className="mt-4 text-lg text-muted-foreground">
                            {article.summary}
                        </p>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-4">
                        <Link
                            href={`/u/${article.author.username}`}
                            className="flex items-center gap-3"
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={article.author.avatarUrl || undefined}/>
                                <AvatarFallback>
                                    {article.author.displayName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{article.author.displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {article.publishedAt && format(new Date(article.publishedAt), "MMM d, yyyy")}
                                    {" · "}
                                    {article.readTime} min read
                                </p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            {user && user.id === article.author.id && (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                >
                                    <Link href={`/write?edit=${article.slug}`}>
                                        <HiOutlinePencilSquare className="h-4 w-4"/>
                                        Edit
                                    </Link>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleClap} className="gap-1">
                                <HiOutlineHandThumbUp className="h-4 w-4"/>
                                {article.claps}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleBookmark}>
                                <HiOutlineBookmark className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </header>

                <Separator className="mb-8"/>

                {/* Cover Image */}
                {article.coverImage && (
                    <div className="relative mb-8 aspect-[2/1] overflow-hidden rounded-xl">
                        <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Content with sidebar */}
                <div className="relative grid gap-8 lg:grid-cols-[1fr_200px]">
                    <div className="fixed left-4 top-1/2 hidden -translate-y-1/2 xl:block">
                        <ShareBar
                            title={article.title}
                            slug={article.slug}
                            username={article.author.username}
                        />
                    </div>

                    <div
                        className="prose-neural"
                        dangerouslySetInnerHTML={{__html: renderMarkdown(article.content)}}
                    />

                    <aside className="hidden lg:block">
                        <div className="sticky top-20">
                            <TableOfContents content={article.content}/>
                        </div>
                    </aside>
                </div>

                {/* Book References */}
                {article.books.length > 0 && (
                    <div className="mt-12 rounded-xl border border-border/50 bg-card p-6">
                        <h3 className="mb-4 font-semibold">Referenced Books</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {article.books.map((book) => (
                                <div key={book.id} className="flex gap-3 rounded-lg p-3 hover:bg-muted">
                                    {book.coverUrl ? (
                                        <Image
                                            src={book.coverUrl}
                                            alt={book.title}
                                            width={48}
                                            height={64}
                                            className="rounded object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-16 w-12 items-center justify-center rounded bg-muted text-xs">
                                            Cover
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">{book.title}</p>
                                        <p className="text-xs text-muted-foreground">{book.author}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </article>

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: article.title,
                        description: article.summary,
                        image: article.coverImage,
                        datePublished: article.publishedAt,
                        dateModified: article.updatedAt,
                        author: {
                            "@type": "Person",
                            name: article.author.displayName,
                            url: `${SITE_URL}/u/${article.author.username}`,
                        },
                        publisher: {
                            "@type": "Organization",
                            name: "NeuralPress",
                            url: SITE_URL,
                        },
                        wordCount: article.content?.split(/\s+/).length || 0,
                        timeRequired: `PT${article.readTime}M`,
                    }),
                }}
            />
        </>
    );
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function renderMarkdown(content: string): string {
    if (!content?.trim()) return "";
    // Support images: ![alt](url) including data: URLs (base64) so in-article images load
    let out = content
        .replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            (_, alt, url) => {
                const safeAlt = escapeHtml(alt || "");
                const raw = url.trim();
                const safeUrl = (raw.startsWith("data:") ? raw : escapeHtml(raw)).replace(/"/g, "&quot;");
                return `<img src="${safeUrl}" alt="${safeAlt}" class="my-4 max-w-full h-auto rounded-lg" loading="lazy" />`;
            }
        )
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/__(.*?)__/g, "<u>$1</u>")
        .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted border border-border rounded-lg p-4 overflow-x-auto my-6"><code class="text-sm font-mono">$2</code></pre>')
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>')
        .replace(/\n\n/g, "</p><p class=\"my-4 font-serif leading-relaxed\">")
        .replace(/^(-|\*)\s+(.+)$/gim, "<li class=\"ml-4\">$2</li>")
        .replace(/^\d+\.\s+(.+)$/gim, "<li class=\"ml-4\">$1</li>")
        .replace(/^(.+)$/gm, (match) => {
            if (match.startsWith("<")) return match;
            return `<p class="my-4 font-serif leading-relaxed">${match}</p>`;
        });
    return out;
}
