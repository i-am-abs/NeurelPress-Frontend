/**
 * Per-tab analytics session id.
 *
 * Stored in `sessionStorage` so it survives soft-navigation but resets when the
 * tab closes. Anonymous, opaque, and never sent to third parties.
 */
const SESSION_KEY = "np_session_id";
const RELEASE_KEY = "np_release";

function uuid(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `s-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function getSessionId(): string {
    if (typeof window === "undefined") return "";
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = uuid();
        window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
}

export function getReleaseTag(): string {
    if (typeof window === "undefined") return "dev";
    const cached = window.sessionStorage.getItem(RELEASE_KEY);
    if (cached) return cached;
    const release = process.env.NEXT_PUBLIC_RELEASE || "dev";
    window.sessionStorage.setItem(RELEASE_KEY, release);
    return release;
}
