"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "next-themes";
import {useState} from "react";
import {Toaster} from "react-hot-toast";

export function Providers({children}: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
