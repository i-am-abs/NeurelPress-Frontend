export const AUTH_TOKEN_KEY = "np_access_token";
export const REFRESH_TOKEN_KEY = "np_refresh_token";

export const DEFAULT_PAGE_SIZE = 12;
export const TRENDING_LIMIT = 7;
export const TOP_TAGS_LIMIT = 12;
export const TOP_BOOKS_LIMIT = 4;
export const DASHBOARD_BOOKS_LIMIT = 3;
export const EXPLORE_TAGS_LIMIT = 15;

export const STALE_TIME_DEFAULT = 60 * 1000;
export const STALE_TIME_LONG = 60 * 60 * 1000;

export const SITE_NAME = "NeuralPress";
export const SITE_URL = "https://neuralpress.dev";
export const SITE_DESCRIPTION =
  "The AI engineering publishing platform for deep technical content.";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
}

export function getOAuthBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8080";
}
