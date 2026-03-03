"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi, articleApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard } from "@/components/article/article-card";
import toast from "react-hot-toast";
import { HiOutlineGlobeAlt } from "react-icons/hi2";

export function ProfilePageContent({ username }: { username: string }) {
  const { user: currentUser } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => userApi.getProfile(username).then((r) => r.data),
  });

  const { data: articles } = useQuery({
    queryKey: ["user-articles", profile?.id],
    queryFn: () =>
      profile ? articleApi.getByAuthor(profile.id, 0, 12).then((r) => r.data) : null,
    enabled: !!profile,
  });

  const { data: followStatus } = useQuery({
    queryKey: ["follow-status", profile?.id],
    queryFn: () =>
      profile && currentUser
        ? userApi.isFollowing(profile.id).then((r) => r.data)
        : null,
    enabled: !!profile && !!currentUser,
  });

  const handleFollow = async () => {
    if (!currentUser || !profile) return;
    try {
      await userApi.toggleFollow(profile.id);
      toast.success(followStatus?.following ? "Unfollowed" : "Following!");
    } catch {
      toast.error("Failed");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Profile Header */}
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatarUrl || undefined} />
          <AvatarFallback className="text-2xl">
            {profile.displayName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-2 text-sm">{profile.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {(profile.followersCount ?? 0).toLocaleString()}
            </span>{" "}
            followers
            <span className="font-medium text-foreground">
              {(profile.followingCount ?? 0).toLocaleString()}
            </span>{" "}
            following
          </div>

          <div className="mt-3 flex items-center gap-3">
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <HiOutlineGlobeAlt className="h-4 w-4" />
                Website
              </a>
            )}
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                GitHub
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {!isOwnProfile && currentUser && (
          <Button
            variant={followStatus?.following ? "outline" : "default"}
            onClick={handleFollow}
          >
            {followStatus?.following ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      {/* Articles */}
      <div className="mt-12">
        <Tabs defaultValue="published">
          <TabsList>
            <TabsTrigger value="published">Published Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-6">
            {articles?.content.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No published articles yet.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {articles?.content.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
