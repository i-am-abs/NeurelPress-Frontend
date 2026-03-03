"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { articleApi, tagApi } from "@/lib/api";
import { ArticleCard } from "@/components/article/article-card";
import { Badge } from "@/components/ui/badge";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PageHeader } from "@/components/shared/page-header";
import { DEFAULT_PAGE_SIZE, EXPLORE_TAGS_LIMIT } from "@/lib/constants";

export default function ExplorePage() {
  const [page, setPage] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: tags } = useQuery({
    queryKey: ["top-tags-explore"],
    queryFn: () => tagApi.getTop(EXPLORE_TAGS_LIMIT).then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["explore-articles", page, selectedTag],
    queryFn: () =>
      selectedTag
        ? articleApi.getByTag(selectedTag, page, DEFAULT_PAGE_SIZE).then((r) => r.data)
        : articleApi.list(page, DEFAULT_PAGE_SIZE).then((r) => r.data),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Explore"
        description="Discover the latest in AI engineering, machine learning, and software development."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <Badge
          variant={selectedTag === null ? "default" : "outline"}
          className="cursor-pointer px-3 py-1.5"
          onClick={() => { setSelectedTag(null); setPage(0); }}
        >
          All
        </Badge>
        {tags?.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTag === tag.slug ? "default" : "outline"}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => { setSelectedTag(tag.slug); setPage(0); }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <LoadingGrid count={9} />
      ) : data?.content.length === 0 ? (
        <EmptyState title="No articles found." />
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
