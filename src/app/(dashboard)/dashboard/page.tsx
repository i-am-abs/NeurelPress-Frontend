"use client";

import {useQuery} from "@tanstack/react-query";
import {useAuthGuard} from "@/hooks/use-auth-guard";
import {articleApi, bookApi} from "@/lib/api";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {EmptyState} from "@/components/shared/empty-state";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns";
import {DASHBOARD_BOOKS_LIMIT} from "@/lib/constants";
import {HiOutlineBolt, HiOutlineBookOpen, HiOutlineEye, HiOutlinePencilSquare, HiOutlineUsers,} from "react-icons/hi2";

export default function DashboardPage() {
    const {user, isLoading: authLoading} = useAuthGuard();

    const {data: drafts, isLoading: draftsLoading} = useQuery({
        queryKey: ["my-drafts"],
        queryFn: () => articleApi.getMyDrafts(0, 5).then((r) => r.data),
        enabled: !!user,
    });

    const {data: published} = useQuery({
        queryKey: ["my-published"],
        queryFn: () => (user ? articleApi.getByAuthor(user.id, 0, 5).then((r) => r.data) : null),
        enabled: !!user,
    });

    const {data: topBooks} = useQuery({
        queryKey: ["top-books-dashboard"],
        queryFn: () => bookApi.getTop(DASHBOARD_BOOKS_LIMIT).then((r) => r.data),
    });

    if (authLoading || !user) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12">
                <Skeleton className="h-10 w-64"/>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Overview</h1>
                <p className="text-muted-foreground">Welcome back, {user.displayName}.</p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    {label: "Total Views", value: "—", icon: HiOutlineEye},
                    {label: "Total Reads", value: "—", icon: HiOutlineBookOpen},
                    {
                        label: "Followers",
                        value: (user.followersCount ?? 0).toLocaleString(),
                        icon: HiOutlineUsers,
                    },
                    {label: "Impact Score", value: "—", icon: HiOutlineBolt},
                ].map((stat) => (
                    <Card key={stat.label} className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                            <stat.icon className="h-5 w-5 text-muted-foreground"/>
                        </div>
                        <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                    </Card>
                ))}
            </div>

            <Card className="mb-8 flex items-center justify-between p-6">
                <div>
                    <h2 className="text-lg font-semibold">Share your knowledge</h2>
                    <p className="text-sm text-muted-foreground">
                        Start a new technical article about AI, Machine Learning, or Software Engineering.
                    </p>
                </div>
                <Button className="gap-2" asChild>
                    <Link href="/write">
                        <HiOutlinePencilSquare className="h-4 w-4"/>
                        Start Writing
                    </Link>
                </Button>
            </Card>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Tabs defaultValue="drafts">
                        <TabsList>
                            <TabsTrigger value="drafts">In Progress</TabsTrigger>
                            <TabsTrigger value="published">Published</TabsTrigger>
                        </TabsList>

                        <TabsContent value="drafts" className="mt-4 space-y-4">
                            {draftsLoading ? (
                                Array.from({length: 3}).map((_, i) => (
                                    <Skeleton key={i} className="h-24 rounded-lg"/>
                                ))
                            ) : drafts?.content.length === 0 ? (
                                <EmptyState title="No drafts yet. Start writing!"/>
                            ) : (
                                drafts?.content.map((article) => (
                                    <Card key={article.id} className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={article.status === "DRAFT" ? "secondary" : "default"}>
                                                        {article.status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(article.createdAt), {addSuffix: true})}
                          </span>
                                                </div>
                                                <h3 className="mt-1 font-semibold truncate">{article.title}</h3>
                                                {article.summary && (
                                                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                                        {article.summary}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex gap-1">
                                                    {article.tags.map((tag) => (
                                                        <Badge key={tag.id} variant="outline" className="text-xs">
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/write?edit=${article.slug}`}>Edit</Link>
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="published" className="mt-4 space-y-4">
                            {published?.content.length === 0 ? (
                                <EmptyState title="No published articles yet."/>
                            ) : (
                                published?.content.map((article) => (
                                    <Card key={article.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold truncate">{article.title}</h3>
                                                <div
                                                    className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>{article.views.toLocaleString()} views</span>
                                                    <span>{article.claps} claps</span>
                                                    <span>{article.bookmarksCount} bookmarks</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <aside className="space-y-6">
                    <Card className="p-5">
                        <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                            <HiOutlineBookOpen className="h-4 w-4 text-primary"/>
                            Reference Library
                        </h3>
                        <div className="space-y-3">
                            {topBooks?.map((book) => (
                                <div key={book.id} className="flex items-center gap-2">
                                    <div className="flex h-8 w-6 items-center justify-center rounded bg-muted text-xs">
                                        📕
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{book.title}</p>
                                        <p className="text-xs text-muted-foreground">{book.author}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
