"use client";

import { useQuery } from "@tanstack/react-query";
import { quoteApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { STALE_TIME_LONG } from "@/lib/constants";

export function HeroQuote() {
  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote-of-day"],
    queryFn: () => quoteApi.today().then((r) => r.data),
    staleTime: STALE_TIME_LONG,
  });

  return (
    <section className="relative overflow-hidden py-16 text-center md:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-6 text-4xl text-primary">&ldquo;&rdquo;</div>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="mx-auto h-8 w-3/4" />
            <Skeleton className="mx-auto h-8 w-1/2" />
            <Skeleton className="mx-auto mt-4 h-5 w-40" />
          </div>
        ) : (
          <>
            <blockquote className="font-serif text-2xl font-medium leading-relaxed text-foreground md:text-3xl">
              &ldquo;{quote?.text}&rdquo;
            </blockquote>
            <p className="mt-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              &mdash; {quote?.author}
            </p>
          </>
        )}
      </motion.div>
    </section>
  );
}
