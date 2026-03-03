"use client";

import type { ArticleSummary } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export function FeaturedArticleCard({ article }: { article: ArticleSummary }) {
  const publishedDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card"
    >
      <Link
        href={`/u/${article.author.username}/${article.slug}`}
        className="grid gap-0 md:grid-cols-2"
      >
        {article.coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-[280px]">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          </div>
        )}

        <div className="flex flex-col justify-center p-6 md:p-8">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            {article.tags[0] && (
              <Badge variant="outline" className="text-xs">
                {article.tags[0].name}
              </Badge>
            )}
            <span>{article.readTime} min read</span>
          </div>

          <h2 className="text-xl font-bold leading-tight group-hover:text-primary md:text-2xl">
            {article.title}
          </h2>

          {article.summary && (
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
              {article.summary}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={article.author.avatarUrl || undefined} />
              <AvatarFallback>{article.author.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{article.author.displayName}</p>
              {publishedDate && (
                <p className="text-xs text-muted-foreground">{publishedDate}</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
