"use client";

import {Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAuthGuard} from "@/hooks/use-auth-guard";
import {useQuery} from "@tanstack/react-query";
import {aiApi, articleApi, tagApi} from "@/lib/api";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import toast from "react-hot-toast";
import {getApiErrorMessage} from "@/lib/api-error";
import type {ArticleRequest} from "@/types";

export default function WritePage() {
    return (
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><p
            className="text-muted-foreground">Loading editor...</p></div>}>
            <WritePageInner/>
        </Suspense>
    );
}

function WritePageInner() {
    const {user} = useAuthGuard();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editSlug = searchParams.get("edit");

    const [form, setForm] = useState<ArticleRequest>({
        title: "",
        summary: "",
        content: "",
        coverImage: "",
        tagSlugs: [],
        seoTitle: "",
        seoDescription: "",
    });
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<"idle" | "saving" | "saved">("idle");
    const [publishing, setPublishing] = useState(false);
    const [aiLoading, setAiLoading] = useState<"tags" | "title" | "summary" | null>(null);
    const [lastAiTitle, setLastAiTitle] = useState<string | null>(null);
    const [lastAiSummary, setLastAiSummary] = useState<string | null>(null);
    const [lastAiTags, setLastAiTags] = useState<string[]>([]);
    const contentRef = useRef<HTMLTextAreaElement | null>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {data: editArticle} = useQuery({
        queryKey: ["edit-article", editSlug],
        queryFn: () =>
            editSlug ? articleApi.getBySlug(editSlug).then((r) => r.data) : null,
        enabled: !!editSlug,
    });

    useEffect(() => {
        if (editArticle) {
            setForm({
                title: editArticle.title,
                summary: editArticle.summary || "",
                content: editArticle.content,
                coverImage: editArticle.coverImage || "",
                tagSlugs: editArticle.tags.map((t) => t.slug),
                seoTitle: editArticle.seoTitle || "",
                seoDescription: editArticle.seoDescription || "",
            });
        }
    }, [editArticle]);

    // Real-time save: debounced auto-save when editing existing draft (skip initial load)
    const isInitialLoad = useRef(true);
    const autoSaveDependencies = `${form.title}|${form.content}|${form.summary}|${form.coverImage}|${form.tagSlugs?.join(",")}|${form.seoTitle}|${form.seoDescription}`;
    
    useEffect(() => {
        if (isInitialLoad.current && editArticle) {
            isInitialLoad.current = false;
            return;
        }
        if (!editSlug || !form.title?.trim() || !form.content?.trim()) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            setLastSaved("saving");
            setSaving(true);
            articleApi.update(editSlug, form)
                .then(() => {
                    setLastSaved("saved");
                    setTimeout(() => setLastSaved("idle"), 2000);
                })
                .catch(() => toast.error("Auto-save failed"))
                .finally(() => {
                    setSaving(false);
                    saveTimeoutRef.current = null;
                });
        }, 2000);
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [editSlug, autoSaveDependencies, editArticle]);

    const {data: allTags} = useQuery({
        queryKey: ["all-tags"],
        queryFn: () => tagApi.getAll().then((r) => r.data),
    });

    const handleSuggestTags = async () => {
        if (!form.content && !form.title) return;
        setAiLoading("tags");
        try {
            const {data} = await aiApi.suggestTags({title: form.title, content: form.content});
            if (data?.length && allTags?.length) {
                const validSlugs = new Set(allTags.map((t) => t.slug));
                const existing = new Set(form.tagSlugs || []);
                const newSlugs = data.filter((s) => validSlugs.has(s) && !existing.has(s));
                if (newSlugs.length) {
                    setForm((prev) => ({...prev, tagSlugs: [...(prev.tagSlugs || []), ...newSlugs]}));
                    setLastAiTags(newSlugs);
                    // Auto-clear the suggestion highlight after 5 seconds
                    setTimeout(() => setLastAiTags([]), 5000);
                }
                toast.success(newSlugs.length ? "Tags suggested." : "No new matching tags. Add from the list below.");
            } else if (data?.length) {
                setLastAiTags(data);
                setTimeout(() => setLastAiTags([]), 5000);
                toast.success("Tags suggested. Add them from the tag list below.");
            }
        } catch {
            toast.error("AI suggestion unavailable. Check backend Gemini API key.");
        } finally {
            setAiLoading(null);
        }
    };

    const handleSuggestTitle = async () => {
        if (!form.content) return;
        setAiLoading("title");
        try {
            const {data} = await aiApi.suggestTitle({content: form.content});
            if (data?.title) {
                setForm((prev) => ({...prev, title: data.title}));
                setLastAiTitle(data.title);
            }
            toast.success("Title suggested.");
        } catch {
            toast.error("AI suggestion unavailable.");
        } finally {
            setAiLoading(null);
        }
    };

    const handleSuggestSummary = async () => {
        if (!form.content) return;
        setAiLoading("summary");
        try {
            const {data} = await aiApi.suggestSummary({content: form.content});
            if (data?.summary) {
                setForm((prev) => ({...prev, summary: data.summary}));
                setLastAiSummary(data.summary);
            }
            toast.success("Summary suggested.");
        } catch {
            toast.error("AI suggestion unavailable.");
        } finally {
            setAiLoading(null);
        }
    };

    const toggleTag = (slug: string) => {
        setForm((prev) => ({
            ...prev,
            tagSlugs: prev.tagSlugs?.includes(slug)
                ? prev.tagSlugs.filter((s) => s !== slug)
                : [...(prev.tagSlugs || []), slug],
        }));
    };

    const applyFormatting = (type: "bold" | "italic" | "underline" | "h1" | "h2" | "h3" | "ul" | "ol" | "quote" | "code" | "image" | "link") => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const value = form.content || "";
        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const selected = value.slice(start, end);

        const wrapInline = (before: string, after: string) => {
            const replacement = selected || "text";
            return value.slice(0, start) + before + replacement + after + value.slice(end);
        };

        const prefixLines = (prefix: string) => {
            const before = value.slice(0, start);
            const selection = value.slice(start, end);
            const after = value.slice(end);
            const lines = (selection || "list item").split("\n");
            const updated = lines.map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`)).join("\n");
            return before + updated + after;
        };

        let next = value;

        switch (type) {
            case "bold":
                next = wrapInline("**", "**");
                break;
            case "italic":
                next = wrapInline("_", "_");
                break;
            case "underline":
                next = wrapInline("__", "__");
                break;
            case "h1":
                next = prefixLines("# ");
                break;
            case "h2":
                next = prefixLines("## ");
                break;
            case "h3":
                next = prefixLines("### ");
                break;
            case "ul":
                next = prefixLines("- ");
                break;
            case "ol":
                next = prefixLines("1. ");
                break;
            case "quote":
                next = prefixLines("> ");
                break;
            case "code":
                next = wrapInline("`", "`");
                break;
            case "image": {
                const url = window.prompt("Image URL");
                if (!url) return;
                const alt = window.prompt("Alt text") || "image";
                const imageSyntax = `![${alt}](${url})`;
                next = value.slice(0, end) + `\n${imageSyntax}\n` + value.slice(end);
                break;
            }
            case "link": {
                const url = window.prompt("Link URL (https://...)");
                if (!url) return;
                const label = selected || window.prompt("Link text") || "link";
                const linkSyntax = `[${label}](${url})`;
                next = value.slice(0, start) + linkSyntax + value.slice(end);
                break;
            }
            default:
                break;
        }

        setForm((prev) => ({...prev, content: next}));
    };

    const handleSave = useCallback(async () => {
        if (!form.title?.trim() || !form.content?.trim()) {
            toast.error("Title and content are required");
            return;
        }
        setSaving(true);
        setLastSaved("saving");
        try {
            if (editSlug) {
                await articleApi.update(editSlug, form);
                setLastSaved("saved");
                setTimeout(() => setLastSaved("idle"), 2000);
                toast.success("Draft saved");
            } else {
                const {data} = await articleApi.create(form);
                toast.success("Draft created");
                router.push(`/write?edit=${data.slug}`);
            }
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, "Failed to save"));
            setLastSaved("idle");
        } finally {
            setSaving(false);
        }
    }, [form, editSlug, router]);

    const handlePublish = async () => {
        if (!form.title?.trim() || !form.content?.trim()) {
            toast.error("Title and content are required");
            return;
        }
        setPublishing(true);
        try {
            let slug = editSlug;
            if (!slug) {
                const { data } = await articleApi.create(form);
                slug = data.slug;
            } else {
                await articleApi.update(slug, form);
            }
            const { data: publishedArticle } = await articleApi.publish(slug);
            if (publishedArticle.status !== "PUBLISHED") {
                console.warn("Article status is not PUBLISHED:", publishedArticle.status);
                toast.error("Failed to publish article - invalid status");
                return;
            }
            toast.success("Article published successfully!");
            // Small delay to ensure DB is refreshed
            await new Promise(resolve => setTimeout(resolve, 500));
            router.push(`/u/${user?.username}/${slug}`);
        } catch (err: unknown) {
            const errorMsg = getApiErrorMessage(err, "Failed to publish");
            console.error("Publish error:", err);
            toast.error(errorMsg);
        } finally {
            setPublishing(false);
        }
    };

    // Keyboard shortcuts (macOS: metaKey, Windows: ctrlKey)
    const handleEditorKeyDown = (e: React.KeyboardEvent) => {
        const mod = e.metaKey || e.ctrlKey;
        const shift = e.shiftKey;
        
        // Ctrl+B: Bold
        if (mod && e.key.toLowerCase() === "b") {
            e.preventDefault();
            applyFormatting("bold");
            return;
        }
        
        // Ctrl+I: Italic
        if (mod && e.key.toLowerCase() === "i") {
            e.preventDefault();
            applyFormatting("italic");
            return;
        }
        
        // Ctrl+U: Underline (strikethrough)
        if (mod && e.key.toLowerCase() === "u") {
            e.preventDefault();
            applyFormatting("underline");
            return;
        }
        
        // Ctrl+S: Save Draft
        if (mod && e.key.toLowerCase() === "s") {
            e.preventDefault();
            void handleSave();
            return;
        }
        
        // Ctrl+Alt+S: Publish
        if (mod && e.altKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            void handlePublish();
            return;
        }
        
        // Ctrl+K: Link
        if (mod && e.key.toLowerCase() === "k") {
            e.preventDefault();
            applyFormatting("link");
            return;
        }
        
        // Ctrl+`: Code
        if (mod && e.key === "`") {
            e.preventDefault();
            applyFormatting("code");
            return;
        }
        
        // Ctrl+Shift+L: Quote
        if (mod && shift && e.key.toLowerCase() === "l") {
            e.preventDefault();
            applyFormatting("quote");
            return;
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-6">
            {/* Medium-style top bar: Draft | Saved */}
            <header
                className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/95 py-3 backdrop-blur">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Draft</span>
                    <span aria-hidden>·</span>
                    <span
                        className={lastSaved === "saved" ? "text-green-600" : lastSaved === "saving" ? "text-amber-600" : ""}>
            {lastSaved === "saving" || saving ? "Saving..." : lastSaved === "saved" ? "Saved" : ""}
          </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSuggestTitle}
                            disabled={!!aiLoading || !form.content} title="Suggest title">
                        {aiLoading === "title" ? "..." : "Title"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSuggestSummary}
                            disabled={!!aiLoading || !form.content} title="Suggest summary">
                        {aiLoading === "summary" ? "..." : "Summary"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSuggestTags} disabled={!!aiLoading}
                            title="Suggest tags">
                        {aiLoading === "tags" ? "..." : "Tags"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" onClick={handlePublish} disabled={publishing}>
                        {publishing ? "..." : "Publish"}
                    </Button>
                </div>
            </header>

            {/* Editor */}
            <div className="space-y-6">
                <Input
                    placeholder="Article title..."
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    className="border-none bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0"
                />

                <Input
                    placeholder="Write a brief summary..."
                    value={form.summary}
                    onChange={(e) => setForm({...form, summary: e.target.value})}
                    className="border-none bg-transparent text-lg text-muted-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0"
                />

                <Input
                    placeholder="Cover image URL (optional)"
                    value={form.coverImage}
                    onChange={(e) => setForm({...form, coverImage: e.target.value})}
                    className="text-sm"
                />

                {/* Tags */}
                <div>
                    <p className="mb-2 text-sm font-medium">Tags</p>
                    {lastAiTags.length > 0 && (
                        <div className="mb-3 rounded-md bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            ✨ AI suggested: {lastAiTags.map(slug => allTags?.find(t => t.slug === slug)?.name).filter(Boolean).join(", ")}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {allTags?.map((tag) => (
                            <Badge
                                key={tag.id}
                                variant={form.tagSlugs?.includes(tag.slug) ? "default" : "outline"}
                                className={`cursor-pointer ${
                                    lastAiTags.includes(tag.slug) ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""
                                }`}
                                onClick={() => toggleTag(tag.slug)}
                            >
                                {tag.name}
                                {lastAiTags.includes(tag.slug) && <span className="ml-1">✨</span>}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Content editor (Markdown) */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">Content (Markdown)</p>
                            <div className="flex flex-wrap gap-1 text-xs">
                                <Button type="button" variant="outline" size="sm"
                                        onClick={() => applyFormatting("bold")}>
                                    B
                                </Button>
                                <Button type="button" variant="outline" size="sm"
                                        onClick={() => applyFormatting("italic")}>
                                    I
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting("h1")}>
                                    H1
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting("h2")}>
                                    H2
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting("h3")}>
                                    H3
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting("ul")}>
                                    • List
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting("ol")}>
                                    1. List
                                </Button>
                                <Button type="button" variant="outline" size="sm"
                                        onClick={() => applyFormatting("quote")}>
                                    “ Quote
                                </Button>
                                <Button type="button" variant="outline" size="sm"
                                        onClick={() => applyFormatting("code")}>
                                    {"</>"}
                                </Button>
                                <Button type="button" variant="outline" size="sm"
                                        onClick={() => applyFormatting("image")}>
                                    Img
                                </Button>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
              {form.content.split(/\s+/).filter(Boolean).length} words
            </span>
                    </div>
                    <Textarea
                        placeholder="Tell your story..."
                        value={form.content}
                        onChange={(e) => setForm({...form, content: e.target.value})}
                        ref={contentRef}
                        onKeyDown={handleEditorKeyDown}
                        className="min-h-[500px] font-mono text-sm leading-relaxed"
                    />
                </div>

                {/* SEO Fields */}
                <details className="rounded-lg border border-border p-4">
                    <summary className="cursor-pointer text-sm font-medium">SEO Settings</summary>
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="text-xs text-muted-foreground">SEO Title</label>
                            <Input
                                value={form.seoTitle}
                                onChange={(e) => setForm({...form, seoTitle: e.target.value})}
                                placeholder="Custom SEO title (defaults to article title)"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">SEO Description</label>
                            <Textarea
                                value={form.seoDescription}
                                onChange={(e) => setForm({...form, seoDescription: e.target.value})}
                                placeholder="Custom meta description (defaults to summary)"
                                rows={2}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
