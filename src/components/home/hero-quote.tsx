"use client";

import {useQuery} from "@tanstack/react-query";
import {quoteApi} from "@/lib/api";
import {motion} from "framer-motion";
import {Skeleton} from "@/components/ui/skeleton";

const FALLBACK_QUOTES = [
    {
        text: "Artificial intelligence is the new electricity.",
        author: "Andrew Ng",
    },
    {
        text: "The greatest value of a picture is when it forces us to notice what we never expected to see.",
        author: "John Tukey",
    },
    {
        text: "In God we trust. All others must bring data.",
        author: "W. Edwards Deming",
    },
    {
        text: "The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.",
        author: "Edsger W. Dijkstra",
    },
    {
        text: "Machine learning is the last invention that humanity will ever need to make.",
        author: "Nick Bostrom",
    },
    {
        text: "The purpose of computing is insight, not numbers.",
        author: "Richard Hamming",
    },
];

export function HeroQuote() {
    const {data: quote, isLoading} = useQuery({
        queryKey: ["front-screen-quote"],
        queryFn: () => quoteApi.frontScreen().then((r) => r.data),
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
    const hasUsableQuote = Boolean(quote?.text?.trim() && quote?.author?.trim());

    return (
        <section className="relative overflow-hidden py-16 text-center md:py-24">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent"/>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="mx-auto max-w-3xl"
            >
                <div className="mb-6 text-4xl text-primary">&ldquo;&rdquo;</div>
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="mx-auto h-8 w-3/4"/>
                        <Skeleton className="mx-auto h-8 w-1/2"/>
                        <Skeleton className="mx-auto mt-4 h-5 w-40"/>
                    </div>
                ) : !hasUsableQuote ? (
                    (() => {
                        const idx =
                            FALLBACK_QUOTES.length === 0
                                ? 0
                                : Math.abs(new Date().getDay()) % FALLBACK_QUOTES.length;
                        const fallback = FALLBACK_QUOTES[idx];
                        return (
                            <>
                                <blockquote
                                    className="font-serif text-2xl font-medium leading-relaxed text-foreground md:text-3xl">
                                    &ldquo;{fallback.text}&rdquo;
                                </blockquote>
                                <p className="mt-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                                    &mdash; {fallback.author}
                                </p>
                            </>
                        );
                    })()
                ) : (
                    <>
                        <blockquote
                            className="font-serif text-2xl font-medium leading-relaxed text-foreground md:text-3xl">
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
