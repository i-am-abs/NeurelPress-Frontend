"use client";

import { useQuery } from "@tanstack/react-query";
import { bookApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { TOP_BOOKS_LIMIT } from "@/lib/constants";

export function BookReferences() {
  const { data: books, isLoading } = useQuery({
    queryKey: ["top-books"],
    queryFn: () => bookApi.getTop(TOP_BOOKS_LIMIT).then((r) => r.data),
  });

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <HiOutlineBookOpen className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Book References</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {books?.map((book) => (
            <Link
              key={book.id}
              href={`/library?book=${book.id}`}
              className="flex gap-3 rounded-lg p-2 transition hover:bg-muted"
            >
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  width={48}
                  height={64}
                  className="rounded object-cover"
                />
              ) : (
                <div className="flex h-16 w-12 items-center justify-center rounded bg-muted text-xs font-medium">
                  Cover
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground">{book.author}</p>
                {book.category && (
                  <span className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {book.category}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
