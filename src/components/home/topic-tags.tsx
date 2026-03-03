"use client";

import { useQuery } from "@tanstack/react-query";
import { tagApi } from "@/lib/api";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { TOP_TAGS_LIMIT } from "@/lib/constants";

const TAG_ICONS: Record<string, string> = {
  "machine-learning": "🧠",
  "deep-learning": "🔬",
  nlp: "💬",
  "computer-vision": "👁️",
  "system-design": "🏗️",
  "cloud-architecture": "☁️",
  devops: "⚙️",
  rust: "🦀",
  python: "🐍",
  typescript: "📘",
  webassembly: "🌐",
  cybersecurity: "🔒",
  "data-engineering": "📊",
  "generative-ai": "✨",
};

export function TopicTags() {
  const { data: tags, isLoading } = useQuery({
    queryKey: ["top-tags"],
    queryFn: () => tagApi.getTop(TOP_TAGS_LIMIT).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-3 py-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap justify-center gap-3 py-4"
    >
      {tags?.map((tag) => (
        <Link key={tag.id} href={`/tag/${tag.slug}`}>
          <Badge
            variant="secondary"
            className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <span className="mr-1.5">{TAG_ICONS[tag.slug] || "📌"}</span>
            {tag.name}
          </Badge>
        </Link>
      ))}
    </motion.div>
  );
}
