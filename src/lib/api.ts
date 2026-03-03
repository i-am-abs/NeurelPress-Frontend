import axios from "axios";
import type {
  Article,
  ArticleSummary,
  AuthResponse,
  Book,
  PageResponse,
  Quote,
  Tag,
  User,
  ArticleRequest,
} from "@/types";
import {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getApiBaseUrl,
} from "@/lib/constants";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const { data } = await axios.post<AuthResponse>(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { username: string; email: string; password: string; displayName?: string }) =>
    api.post<AuthResponse>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data),
  me: () => api.get<User>("/auth/me"),
  logout: () => api.post("/auth/logout"),
  verifyEmail: (token: string) =>
    api.get("/auth/verify-email", { params: { token } }),
  resendVerification: () => api.post<{ message: string }>("/auth/resend-verification"),
};

// Articles
export const articleApi = {
  list: (page = 0, size = 12) =>
    api.get<PageResponse<ArticleSummary>>("/articles", { params: { page, size } }),
  getBySlug: (slug: string) =>
    api.get<Article>(`/articles/${slug}`),
  getByTag: (tagSlug: string, page = 0, size = 12) =>
    api.get<PageResponse<ArticleSummary>>(`/articles/tag/${tagSlug}`, { params: { page, size } }),
  getByAuthor: (authorId: string, page = 0, size = 12) =>
    api.get<PageResponse<ArticleSummary>>(`/articles/author/${authorId}`, { params: { page, size } }),
  getMyDrafts: (page = 0, size = 12) =>
    api.get<PageResponse<ArticleSummary>>("/articles/me/drafts", { params: { page, size } }),
  create: (data: ArticleRequest) =>
    api.post<Article>("/articles", data),
  update: (slug: string, data: ArticleRequest) =>
    api.put<Article>(`/articles/${slug}`, data),
  publish: (slug: string) =>
    api.post<Article>(`/articles/${slug}/publish`),
  delete: (slug: string) =>
    api.delete(`/articles/${slug}`),
  clap: (slug: string) =>
    api.post(`/articles/${slug}/clap`),
};

// Trending
export const trendingApi = {
  get: (limit = 10) =>
    api.get<ArticleSummary[]>("/trending", { params: { limit } }),
};

// Tags
export const tagApi = {
  getAll: () => api.get<Tag[]>("/tags"),
  getTop: (limit = 10) => api.get<Tag[]>("/tags/top", { params: { limit } }),
};

// Books
export const bookApi = {
  list: (page = 0, size = 12) =>
    api.get<PageResponse<Book>>("/books", { params: { page, size } }),
  getById: (id: string) => api.get<Book>(`/books/${id}`),
  getTop: (limit = 5) => api.get<Book[]>("/books/top", { params: { limit } }),
  search: (q: string, page = 0, size = 12) =>
    api.get<PageResponse<Book>>("/books/search", { params: { q, page, size } }),
};

// Bookmarks
export const bookmarkApi = {
  toggle: (slug: string) => api.post(`/bookmarks/${slug}`),
  list: (page = 0, size = 12) =>
    api.get<PageResponse<ArticleSummary>>("/bookmarks", { params: { page, size } }),
};

// Users
export const userApi = {
  getProfile: (username: string) => api.get<User>(`/users/${username}/profile`),
  updateProfile: (data: Partial<User>) => api.patch<User>("/users/me/profile", data),
  toggleFollow: (userId: string) => api.post(`/users/${userId}/follow`),
  isFollowing: (userId: string) =>
    api.get<{ following: boolean }>(`/users/${userId}/following`),
};

// Quotes
export const quoteApi = {
  today: () => api.get<Quote>("/quotes/today"),
};

// AI (Gemini-powered suggestions)
export const aiApi = {
  suggestTags: (data: { title: string; content: string }) =>
    api.post<string[]>("/ai/suggest-tags", data),
  suggestTitle: (data: { content: string }) =>
    api.post<{ title: string }>("/ai/suggest-title", data),
  suggestSummary: (data: { content: string }) =>
    api.post<{ summary: string }>("/ai/suggest-summary", data),
};

export default api;
