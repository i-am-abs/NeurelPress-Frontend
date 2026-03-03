"use client";

import { useMemo } from "react";

interface TocProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: TocProps) {
  const headings = useMemo(() => {
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      const text = match[2].replace(/[*_`\[\]]/g, "");
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      items.push({ id, text, level: match[1].length });
    }

    return items;
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Table of Contents
      </h4>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className="block text-sm text-muted-foreground transition hover:text-foreground"
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
