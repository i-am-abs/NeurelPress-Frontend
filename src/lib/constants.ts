export const AUTH_TOKEN_KEY = "np_access_token";
export const REFRESH_TOKEN_KEY = "np_refresh_token";

export const DEFAULT_PAGE_SIZE = 12;
export const TRENDING_LIMIT = 7;
export const TOP_TAGS_LIMIT = 12;
export const TOP_BOOKS_LIMIT = 4;
export const DASHBOARD_BOOKS_LIMIT = 3;
export const EXPLORE_TAGS_LIMIT = 15;

export const STALE_TIME_LONG = 60 * 60 * 1000;

export const SITE_URL = "https://neuralpress.dev";

function normalizeApiUrl(rawUrl: string): string {
    if (typeof window === "undefined") {
        return rawUrl;
    }

    try {
        const parsed = new URL(rawUrl);
        const frontendHost = window.location.hostname;
        const isLoopbackFrontend = frontendHost === "127.0.0.1" || frontendHost === "localhost";
        const isLoopbackApiHost = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";

        // Keep frontend/backend on the same loopback host variant to avoid
        // localhost <-> 127.0.0.1 resolution mismatches in some environments.
        if (isLoopbackFrontend && isLoopbackApiHost && parsed.hostname !== frontendHost) {
            parsed.hostname = frontendHost;
            return parsed.toString().replace(/\/$/, "");
        }
    } catch {
        // Return raw value if URL parsing fails.
    }

    return rawUrl;
}

export function getApiBaseUrl(): string {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api";
    return normalizeApiUrl(base);
}

export function getOAuthBaseUrl(): string {
    const oauthBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8080";
    return normalizeApiUrl(oauthBase);
}
