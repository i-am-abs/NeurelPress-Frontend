import axios, {AxiosInstance} from "axios";
import {AUTH_TOKEN_KEY, getApiBaseUrl} from "@/lib/constants";
import {getReleaseTag, getSessionId} from "@/lib/session";

/**
 * Lightweight analytics client.
 *
 * <p>Talks to the backend's `/api/analytics/*` ingestion endpoints. Designed
 * to fail silent: a flaky analytics call must never block a user's session.
 *
 * <p>Separate from the main `api` instance so:
 *   - the request interceptor that injects bearer tokens still works for both
 *   - we can disable analytics globally by setting `NEXT_PUBLIC_ANALYTICS_ENABLED=false`
 */

const ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false";

const client: AxiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {"Content-Type": "application/json"},
    timeout: 4000,
});

client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

export interface TrackEventInput {
    eventName: string;
    entityType?: string;
    entityId?: string;
    path?: string;
    referrer?: string;
    metadata?: Record<string, unknown>;
}

export interface CrashInput {
    message: string;
    exceptionType?: string;
    stackTrace?: string;
    path?: string;
    userAgent?: string;
}

function detectDevice(): string {
    if (typeof navigator === "undefined") return "unknown";
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
    if (/iPad|Tablet/i.test(ua)) return "tablet";
    return "desktop";
}

export const analytics = {
    async track(event: TrackEventInput): Promise<void> {
        if (!ENABLED || typeof window === "undefined") return;
        try {
            await client.post("/analytics/track", {
                eventName: event.eventName,
                entityType: event.entityType,
                entityId: event.entityId,
                sessionId: getSessionId(),
                path: event.path ?? window.location.pathname,
                referrer: event.referrer ?? (document.referrer || undefined),
                device: detectDevice(),
                metadata: event.metadata ? JSON.stringify(event.metadata).slice(0, 1024) : undefined,
            });
        } catch {
            // analytics is best-effort
        }
    },

    async crash(error: CrashInput): Promise<void> {
        if (!ENABLED || typeof window === "undefined") return;
        try {
            await client.post("/analytics/crash", {
                message: error.message.slice(0, 256),
                exceptionType: error.exceptionType,
                stackTrace: error.stackTrace?.slice(0, 8000),
                path: error.path ?? window.location.pathname,
                sessionId: getSessionId(),
                release: getReleaseTag(),
                userAgent: error.userAgent ?? navigator.userAgent,
            });
        } catch {
            // crash reporter must never throw
        }
    },
};

/**
 * Auto-attach window-level error listeners. Idempotent.
 */
export function installCrashReporter(): void {
    if (typeof window === "undefined") return;
    const w = window as unknown as { __npCrashInstalled?: boolean };
    if (w.__npCrashInstalled) return;
    w.__npCrashInstalled = true;

    window.addEventListener("error", (e: ErrorEvent) => {
        analytics.crash({
            message: e.message || "window.error",
            exceptionType: e.error?.name,
            stackTrace: e.error?.stack,
        });
    });

    window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
        const reason = e.reason;
        analytics.crash({
            message: typeof reason === "string"
                ? reason
                : reason?.message || "unhandled-rejection",
            exceptionType: reason?.name,
            stackTrace: reason?.stack,
        });
    });
}
