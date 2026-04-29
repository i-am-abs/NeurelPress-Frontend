import axios, {AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig} from "axios";
import type {
    Article,
    ArticleRequest,
    ArticleSummary,
    AuthResponse,
    Book,
    PageResponse,
    Quote,
    Tag,
    ToneAnalysisResponse,
    User,
} from "@/types";
import {AUTH_TOKEN_KEY, getApiBaseUrl, REFRESH_TOKEN_KEY} from "@/lib/constants";

/**
 * Singleton axios instance.
 *
 * - Bearer token attached automatically when present.
 * - On 401 we attempt a single refresh, then queue concurrent in-flight
 *   requests so we don't hammer `/auth/refresh` N times.
 * - Failures fall back to a clean logout + redirect to /login.
 */
const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {"Content-Type": "application/json"},
    timeout: 15000,
});

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
    pendingQueue.forEach((cb) => cb(token));
    pendingQueue = [];
}

function setTokens(access: string, refresh: string | null) {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTH_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

function clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as RetriableConfig | undefined;
        const isUnauthorized = error.response?.status === 401;

        if (!isUnauthorized || !original || original._retry) {
            return Promise.reject(error);
        }

        original._retry = true;
        const refreshToken = typeof window !== "undefined"
            ? localStorage.getItem(REFRESH_TOKEN_KEY)
            : null;

        if (!refreshToken) {
            clearTokens();
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push((newToken) => {
                    if (!newToken) {
                        reject(error);
                        return;
                    }
                    original.headers = {...(original.headers ?? {}), Authorization: `Bearer ${newToken}`};
                    resolve(api(original));
                });
            });
        }

        isRefreshing = true;
        try {
            const {data} = await axios.post<AuthResponse>(
                `${api.defaults.baseURL}/auth/refresh`,
                {refreshToken}
            );
            setTokens(data.accessToken, data.refreshToken);
            flushQueue(data.accessToken);
            original.headers = {...(original.headers ?? {}), Authorization: `Bearer ${data.accessToken}`};
            return api(original);
        } catch (refreshErr) {
            flushQueue(null);
            clearTokens();
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    }
);

export const authApi = {
    register: (data: { username: string; email: string; password: string; displayName?: string }) =>
        api.post<AuthResponse>("/auth/register", data),

    login: (data: { email: string; password: string }) =>
        api.post<AuthResponse>("/auth/login", data),

    requestOtp: (data: { email: string }) =>
        api.post<{ message: string }>("/auth/request-otp", data),

    loginWithOtp: (data: { email: string; otp: string }) =>
        api.post<AuthResponse>("/auth/login-otp", data),

    googleSignIn: (idToken: string) =>
        api.post<AuthResponse>("/auth/google", {idToken}),

    me: () => api.get<User>("/auth/me"),

    logout: () => api.post("/auth/logout"),

    verifyEmail: (token: string) =>
        api.get("/auth/verify-email", {params: {token}}),

    resendVerification: () =>
        api.post<{ message: string }>("/auth/resend-verification"),

    forgotPassword: (email: string) =>
        api.post<{ message: string }>("/auth/forgot-password", {email}),

    resetPassword: (token: string, newPassword: string) =>
        api.post<{ message: string }>("/auth/reset-password", {token, newPassword}),
};

export const articleApi = {
    list: (page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>("/articles/latest", {params: {page, size}}),

    getBySlug: (slug: string) => api.get<Article>(`/articles/${slug}`),

    getByTag: (tagSlug: string, page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>(`/articles/tag/${tagSlug}`, {params: {page, size}}),

    getByAuthor: (authorId: string, page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>(`/articles/author/${authorId}`, {params: {page, size}}),

    getMyDrafts: (page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>("/articles/me/drafts", {params: {page, size}}),

    create: (data: ArticleRequest) => api.post<Article>("/articles", data),

    update: (slug: string, data: ArticleRequest) =>
        api.put<Article>(`/articles/${slug}`, data),

    publish: (slug: string) => api.post<Article>(`/articles/${slug}/publish`),

    delete: (slug: string) => api.delete(`/articles/${slug}`),

    clap: (slug: string) => api.post(`/articles/${slug}/clap`),
};

export const trendingApi = {
    get: (limit = 10) =>
        api.get<ArticleSummary[]>("/trending", {params: {limit}}),
};

export const tagApi = {
    getAll: () => api.get<Tag[]>("/tags"),
    getTop: (limit = 10) => api.get<Tag[]>("/tags/top", {params: {limit}}),
};

export const bookApi = {
    list: (page = 0, size = 12) =>
        api.get<PageResponse<Book>>("/books", {params: {page, size}}),

    getById: (id: string) => api.get<Book>(`/books/${id}`),

    getTop: (limit = 5) => api.get<Book[]>("/books/top", {params: {limit}}),

    search: (q: string, page = 0, size = 12) =>
        api.get<PageResponse<Book>>("/books/search", {params: {q, page, size}}),
};

export const bookmarkApi = {
    toggle: (slug: string) => api.post(`/bookmarks/${slug}`),

    list: (page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>("/bookmarks", {params: {page, size}}),
};

export const userApi = {
    getProfile: (username: string) =>
        api.get<User>(`/users/${username}/profile`),

    updateProfile: (data: Partial<User>) =>
        api.patch<User>("/users/me/profile", data),

    toggleFollow: (userId: string) => api.post(`/users/${userId}/follow`),

    isFollowing: (userId: string) =>
        api.get<{ following: boolean }>(`/users/${userId}/following`),

    search: (query: string, page = 0, size = 12) =>
        api.get<PageResponse<User>>("/users/search", {params: {query, page, size}}),
};

export const quoteApi = {
    today: () => api.get<Quote>("/quotes/today"),
    random: () => api.get<Quote>("/quotes/random"),
    randomByDomain: (domain: string) => api.get<Quote>(`/quotes/random/domain/${encodeURIComponent(domain)}`),
    punchlineByDomain: (domain: string) => api.get<Quote>(`/quotes/punchline/domain/${encodeURIComponent(domain)}`),
    frontScreen: () => api.get<Quote>("/quotes/random/front-screen"),
};

export const aiApi = {
    suggestTags: (data: { title: string; content: string }) =>
        api.post<string[]>("/ai/suggest-tags", data),

    suggestTitle: (data: { content: string }) =>
        api.post<{ title: string }>("/ai/suggest-title", data),

    suggestSummary: (data: { content: string }) =>
        api.post<{ summary: string }>("/ai/suggest-summary", data),

    humanize: (data: { content: string }) =>
        api.post<{ content: string }>("/ai/humanize", data),

    analyzeTone: (data: { content: string }) =>
        api.post<ToneAnalysisResponse>("/ai/analyze-tone", data),

    generateByTone: (data: { content: string; tone: string }) =>
        api.post<{ content: string }>("/ai/generate-by-tone", data),
};

export const uploadApi = {
    uploadImage: (file: File, folder: string = "uploads") => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        return api.post<{ url: string }>("/upload/image", formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });
    },
};

export default api;
