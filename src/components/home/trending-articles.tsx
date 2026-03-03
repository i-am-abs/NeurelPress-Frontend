"use client";

import { useQuery } from "@tanstack/react-query";
import { trendingApi } from "@/lib/api";
import { ArticleCard } from "@/components/article/article-card";
import { FeaturedArticleCard } from "@/components/article/featured-article-card";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { TRENDING_LIMIT } from "@/lib/constants";

export function TrendingArticles() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => trendingApi.get(TRENDING_LIMIT).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trending Articles</h2>
        </div>
        <Skeleton className="mb-6 h-64 w-full rounded-xl" />
        <LoadingGrid count={4} columns="2" itemHeight="h-48" />
      </section>
    );
  }

  const featured = articles?.[0];
  const rest = articles?.slice(1) || [];

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trending Articles</h2>
        <Link
          href="/explore"
          className="text-sm text-muted-foreground transition hover:text-primary"
        >
          View all
        </Link>
      </div>

      {featured && <FeaturedArticleCard article={featured} />}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {rest.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
