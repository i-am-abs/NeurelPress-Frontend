"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useQuery } from "@tanstack/react-query";
import { articleApi, tagApi, aiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ArticleRequest } from "@/types";

export default function WritePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><p className="text-muted-foreground">Loading editor...</p></div>}>
      <WritePageInner />
    </Suspense>
  );
}

function WritePageInner() {
  const { user } = useAuthGuard();
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
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState<"tags" | "title" | "summary" | null>(null);

  const { data: editArticle } = useQuery({
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

  const { data: allTags } = useQuery({
    queryKey: ["all-tags"],
    queryFn: () => tagApi.getAll().then((r) => r.data),
  });

  const handleSuggestTags = async () => {
    if (!form.content && !form.title) return;
    setAiLoading("tags");
    try {
      const { data } = await aiApi.suggestTags({ title: form.title, content: form.content });
      if (data?.length && allTags?.length) {
        const validSlugs = new Set(allTags.map((t) => t.slug));
        const existing = new Set(form.tagSlugs || []);
        const newSlugs = data.filter((s) => validSlugs.has(s) && !existing.has(s));
        if (newSlugs.length) setForm((prev) => ({ ...prev, tagSlugs: [...(prev.tagSlugs || []), ...newSlugs] }));
        toast.success(newSlugs.length ? "Tags suggested." : "No new matching tags. Add from the list below.");
      } else if (data?.length) {
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
      const { data } = await aiApi.suggestTitle({ content: form.content });
      if (data?.title) setForm((prev) => ({ ...prev, title: data.title }));
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
      const { data } = await aiApi.suggestSummary({ content: form.content });
      if (data?.summary) setForm((prev) => ({ ...prev, summary: data.summary }));
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

  const handleSave = useCallback(async () => {
    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      if (editSlug) {
        await articleApi.update(editSlug, form);
        toast.success("Draft saved");
      } else {
        const { data } = await articleApi.create(form);
        toast.success("Draft created");
        router.push(`/write?edit=${data.slug}`);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  }, [form, editSlug, router]);

  const handlePublish = async () => {
    if (!editSlug) {
      await handleSave();
      return;
    }
    setPublishing(true);
    try {
      await articleApi.publish(editSlug);
      toast.success("Article published!");
      router.push(`/u/${user?.username}/${editSlug}`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to publish"));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Drafts</span>
          <span>/</span>
          <span>{editSlug ? "Editing" : "New Post"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSuggestTitle} disabled={!!aiLoading || !form.content}>
            {aiLoading === "title" ? "..." : "Suggest title"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSuggestSummary} disabled={!!aiLoading || !form.content}>
            {aiLoading === "summary" ? "..." : "Suggest summary"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSuggestTags} disabled={!!aiLoading}>
            {aiLoading === "tags" ? "..." : "Suggest tags"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={publishing}>
            {publishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-6">
        <Input
          placeholder="Article title..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border-none bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0"
        />

        <Input
          placeholder="Write a brief summary..."
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="border-none bg-transparent text-lg text-muted-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0"
        />

        <Input
          placeholder="Cover image URL (optional)"
          value={form.coverImage}
          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
          className="text-sm"
        />

        {/* Tags */}
        <div>
          <p className="mb-2 text-sm font-medium">Tags</p>
          <div className="flex flex-wrap gap-2">
            {allTags?.map((tag) => (
              <Badge
                key={tag.id}
                variant={form.tagSlugs?.includes(tag.slug) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag.slug)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content editor (Markdown) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Content (Markdown)</p>
            <span className="text-xs text-muted-foreground font-mono">
              {form.content.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <Textarea
            placeholder="Write your article in Markdown..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
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
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                placeholder="Custom SEO title (defaults to article title)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">SEO Description</label>
              <Textarea
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
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
