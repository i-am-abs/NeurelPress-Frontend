"use client";

import type { ArticleSummary } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface ArticleCardProps {
  article: ArticleSummary;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-border/50 bg-card transition-all hover:border-border hover:shadow-lg"
    >
      <Link href={`/u/${article.author.username}/${article.slug}`}>
        {article.coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {article.tags[0] && (
              <Badge className="absolute right-3 top-3" variant="secondary">
                {article.tags[0].name}
              </Badge>
            )}
          </div>
        )}

        <div className="p-5">
          {!article.coverImage && article.tags[0] && (
            <Badge variant="secondary" className="mb-2">
              {article.tags[0].name}
            </Badge>
          )}

          <h3 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
            {article.title}
          </h3>

          {article.summary && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {article.summary}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={article.author.avatarUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {article.author.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{article.author.displayName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {publishedDate && <span>{publishedDate}</span>}
              <span>{article.readTime} min read</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
