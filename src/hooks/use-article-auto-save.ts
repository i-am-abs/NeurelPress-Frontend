"use client";

import {useEffect, useRef} from "react";
import toast from "react-hot-toast";
import {articleApi} from "@/lib/api";
import type {ArticleRequest} from "@/types";

interface UseArticleAutoSaveParams {
    editSlug: string | null;
    form: ArticleRequest;
    editArticleLoaded: boolean;
    setSaving: (saving: boolean) => void;
    setLastSaved: (state: "idle" | "saving" | "saved") => void;
}

export function useArticleAutoSave({
    editSlug,
    form,
    editArticleLoaded,
    setSaving,
    setLastSaved,
}: UseArticleAutoSaveParams) {
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialLoad = useRef(true);
    const autoSaveDependencies = `${form.title}|${form.content}|${form.summary}|${form.coverImage}|${form.tagSlugs?.join(",")}|${form.seoTitle}|${form.seoDescription}`;

    useEffect(() => {
        if (isInitialLoad.current && editArticleLoaded) {
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
    }, [autoSaveDependencies, editArticleLoaded, editSlug, form, setLastSaved, setSaving]);
}
