export type AuthProviderType = "LOCAL" | "GOOGLE" | "GITHUB";

export interface User {
    id: string;
    username: string;
    email: string;
    displayName: string;
    headline: string | null;
    bio: string | null;
    avatarUrl: string | null;
    role: "USER" | "ADMIN";
    /** How the account was created / primary identity (stored in DB). */
    authProvider: AuthProviderType;
    /** Allowed methods: LOCAL → password, otp; OAuth → google or github. */
    allowedLoginMethods: string[];
    verified: boolean;
    followersCount: number;
    followingCount: number;
    githubUrl: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    techTags: string | null;
    publishedArticleCount?: number;
    createdAt: string;
    lastSignInAt: string | null;
}

export interface AuthorSummary {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
}

export interface Article {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    content: string;
    coverImage: string | null;
    status: "DRAFT" | "PUBLISHED";
    readTime: number;
    views: number;
    claps: number;
    bookmarksCount: number;
    commentsCount: number;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author: AuthorSummary;
    tags: Tag[];
    books: Book[];
}

export interface ArticleSummary {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    coverImage: string | null;
    status: "DRAFT" | "PUBLISHED";
    readTime: number;
    views: number;
    claps: number;
    bookmarksCount: number;
    publishedAt: string | null;
    createdAt: string;
    author: AuthorSummary;
    tags: Tag[];
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    articleCount: number;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    description: string | null;
    coverUrl: string | null;
    category: string | null;
    rating: number;
    referencedCount: number;
    affiliateUrl: string | null;
}

export interface Quote {
    id: string;
    text: string;
    author: string;
    source: string | null;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export interface ArticleRequest {
    title: string;
    summary?: string;
    content: string;
    coverImage?: string;
    tagSlugs?: string[];
    bookIds?: string[];
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
}

export interface ToneAnalysisResponse {
    tone: string;
    confidence: number;
    notes: string;
}
