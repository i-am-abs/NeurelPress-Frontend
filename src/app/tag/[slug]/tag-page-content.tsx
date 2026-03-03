"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { articleApi } from "@/lib/api";
import { ArticleCard } from "@/components/article/article-card";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PageHeader } from "@/components/shared/page-header";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export function TagPageContent({ slug }: { slug: string }) {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["tag-articles", slug, page],
    queryFn: () => articleApi.getByTag(slug, page, DEFAULT_PAGE_SIZE).then((r) => r.data),
  });

  const tagName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title={tagName} description={`Articles tagged with ${tagName}`} />

      {isLoading ? (
        <LoadingGrid />
      ) : data?.content.length === 0 ? (
        <EmptyState title="No articles found for this tag." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.content.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {data && (
        <PaginationControls
          page={page}
          totalPages={data.totalPages}
          isLast={data.last}
          onPrevious={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </div>
  );
}
