import axios, {AxiosError, InternalAxiosRequestConfig} from "axios";
import type {
    Article,
    ArticleRequest,
    ArticleSummary,
    AuthResponse,
    Book,
    PageResponse,
    Quote,
    Tag,
    User,
} from "@/types";
import {AUTH_TOKEN_KEY, getApiBaseUrl, REFRESH_TOKEN_KEY,} from "@/lib/constants";

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {"Content-Type": "application/json"},
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }
    }

    if (process.env.NODE_ENV !== "production") {
        console.log(
            "[API request]",
            config.method?.toUpperCase(),
            `${config.baseURL}${config.url}`,
            {params: config.params}
        );
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV !== "production") {
            console.log(
                "[API response]",
                response.config.method?.toUpperCase(),
                `${response.config.baseURL}${response.config.url}`,
                response.status
            );
        }

        return response;
    },
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;

            if (typeof window !== "undefined") {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

                if (refreshToken) {
                    try {
                        const {data} = await axios.post<AuthResponse>(
                            `${api.defaults.baseURL}/auth/refresh`,
                            {refreshToken}
                        );

                        localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
                        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                        return api(originalRequest);
                    } catch {
                        localStorage.removeItem(AUTH_TOKEN_KEY);
                        localStorage.removeItem(REFRESH_TOKEN_KEY);

                        if (typeof window !== "undefined") {
                            window.location.href = "/login";
                        }
                    }
                }
            }
        }

        if (process.env.NODE_ENV !== "production") {
            console.error(
                "[API error]",
                originalRequest?.method?.toUpperCase(),
                `${originalRequest?.baseURL}${originalRequest?.url}`,
                error.response?.status,
                error.response?.data
            );
        }

        return Promise.reject(error);
    }
);

export const authApi = {
    register: (data: {
        username: string;
        email: string;
        password: string;
        displayName?: string;
    }) => api.post<AuthResponse>("/auth/register", data),

    login: (data: { email: string; password: string }) =>
        api.post<AuthResponse>("/auth/login", data),

    requestOtp: (data: { email: string }) =>
        api.post<{ message: string }>("/auth/request-otp", data),

    loginWithOtp: (data: { email: string; otp: string }) =>
        api.post<AuthResponse>("/auth/login-otp", data),

    me: () => api.get<User>("/auth/me"),

    logout: () => api.post("/auth/logout"),

    verifyEmail: (token: string) =>
        api.get("/auth/verify-email", {params: {token}}),

    resendVerification: () =>
        api.post<{ message: string }>("/auth/resend-verification"),
};

export const articleApi = {
    list: (page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>("/articles", {params: {page, size}}),

    getBySlug: (slug: string) => api.get<Article>(`/articles/${slug}`),

    getByTag: (tagSlug: string, page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>(`/articles/tag/${tagSlug}`, {
            params: {page, size},
        }),

    getByAuthor: (authorId: string, page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>(`/articles/author/${authorId}`, {
            params: {page, size},
        }),

    getMyDrafts: (page = 0, size = 12) =>
        api.get<PageResponse<ArticleSummary>>("/articles/me/drafts", {
            params: {page, size},
        }),

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
        api.get<PageResponse<ArticleSummary>>("/bookmarks", {
            params: {page, size},
        }),
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
        api.get<PageResponse<User>>("/users/search", {
            params: {query, page, size},
        }),
};

export const quoteApi = {
    today: () => api.get<Quote>("/quotes/today"),
};

export const aiApi = {
    suggestTags: (data: { title: string; content: string }) =>
        api.post<string[]>("/ai/suggest-tags", data),

    suggestTitle: (data: { content: string }) =>
        api.post<{ title: string }>("/ai/suggest-title", data),

    suggestSummary: (data: { content: string }) =>
        api.post<{ summary: string }>("/ai/suggest-summary", data),
};

export default api;