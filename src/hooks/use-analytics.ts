"use client";

import {useCallback, useEffect, useRef} from "react";
import {usePathname} from "next/navigation";
import {analytics, TrackEventInput} from "@/lib/analytics";

/**
 * Auto-fires a `page_view` event whenever the route changes.
 * Use once at the root of the App Router (in providers.tsx).
 */
export function usePageViewTracker(): void {
    const pathname = usePathname();
    const lastPath = useRef<string | null>(null);

    useEffect(() => {
        if (!pathname || pathname === lastPath.current) return;
        lastPath.current = pathname;
        void analytics.track({eventName: "page_view", path: pathname});
    }, [pathname]);
}

/**
 * Stable callback to track ad-hoc events from any component.
 */
export function useTrackEvent(): (e: TrackEventInput) => void {
    return useCallback((e: TrackEventInput) => {
        void analytics.track(e);
    }, []);
}
