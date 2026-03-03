"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookmarkApi } from "@/lib/api";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ArticleCard } from "@/components/article/article-card";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { HiOutlineBookmark } from "react-icons/hi2";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function BookmarksPage() {
  const { user, isLoading: authLoading } = useAuthGuard();
  const router = useRouter();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks", page],
    queryFn: () => bookmarkApi.list(page, DEFAULT_PAGE_SIZE).then((r) => r.data),
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Bookmarks" icon={HiOutlineBookmark} />

      {isLoading ? (
        <LoadingGrid />
      ) : data?.content.length === 0 ? (
        <EmptyState
          icon={HiOutlineBookmark}
          title="No bookmarks yet."
          actionLabel="Explore articles"
          onAction={() => router.push("/explore")}
        />
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
