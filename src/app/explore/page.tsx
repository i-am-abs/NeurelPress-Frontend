"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { userApi } from "@/lib/api";
import type { User } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return null;
      const res = await userApi.search(debouncedSearch, 0, 20);
      return res.data;
    },
    enabled: debouncedSearch.length > 0,
  });

  const users: User[] = data?.content ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Explore authors</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Search for writers by username or display name.
      </p>

      <div className="relative mb-6">
        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <p className="text-sm text-red-600">Failed to search users. Please try again.</p>
      )}

      {!isLoading && !isError && debouncedSearch && users.length === 0 && (
        <p className="text-sm text-muted-foreground">No users found for this query.</p>
      )}

      {!isLoading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <Link key={user.id} href={`/u/${user.username}`} className="block">
              <Card className="p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                  <AvatarFallback>
                    {user.displayName?.[0]?.toUpperCase() ?? user.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{user.displayName || user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  {user.bio && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!debouncedSearch && (
        <p className="mt-4 text-sm text-muted-foreground">
          Start typing above to search for users.
        </p>
      )}
    </div>
  );
}

