"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "next-themes";
import {useEffect, useState} from "react";
import {Toaster} from "react-hot-toast";
import {installCrashReporter} from "@/lib/analytics";
import {usePageViewTracker} from "@/hooks/use-analytics";

function AnalyticsBootstrap() {
    usePageViewTracker();
    return null;
}

export function Providers({children}: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                    mutations: {retry: 0},
                },
            })
    );

    useEffect(() => {
        installCrashReporter();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                <AnalyticsBootstrap/>
                {children}
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        className: "!bg-card !text-card-foreground !border !border-border",
                    }}
                />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
