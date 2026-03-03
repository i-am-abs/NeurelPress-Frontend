import { HeroQuote } from "@/components/home/hero-quote";
import { TopicTags } from "@/components/home/topic-tags";
import { TrendingArticles } from "@/components/home/trending-articles";
import { BookReferences } from "@/components/home/book-references";
import { NewsletterCta } from "@/components/home/newsletter-cta";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <HeroQuote />
      <TopicTags />
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendingArticles />
        </div>
        <aside className="space-y-8">
          <BookReferences />
          <NewsletterCta />
        </aside>
      </div>
    </div>
  );
}
