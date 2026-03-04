"use client";

import {useEffect} from "react";
import {Button} from "@/components/ui/button";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({error, reset}: ErrorPageProps) {
    useEffect(() => {
        console.error("Unhandled error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
                An unexpected error occurred. Please try again or refresh the page.
            </p>
            <div className="flex gap-3">
                <Button onClick={reset}>Try again</Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                    Go home
                </Button>
            </div>
        </div>
    );
}
