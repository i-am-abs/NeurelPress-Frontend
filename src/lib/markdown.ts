function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function renderMarkdown(content: string): string {
    if (!content?.trim()) return "";

    return content
        .replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            (_, alt, url) => {
                const safeAlt = escapeHtml(alt || "");
                const raw = url.trim();
                const safeUrl = (raw.startsWith("data:") ? raw : escapeHtml(raw)).replace(/"/g, "&quot;");
                return `<img src="${safeUrl}" alt="${safeAlt}" class="my-4 max-w-full h-auto rounded-lg" loading="lazy" />`;
            }
        )
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/__(.*?)__/g, "<u>$1</u>")
        .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted border border-border rounded-lg p-4 overflow-x-auto my-6"><code class="text-sm font-mono">$2</code></pre>')
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>')
        .replace(/\n\n/g, "</p><p class=\"my-4 font-serif leading-relaxed\">")
        .replace(/^(-|\*)\s+(.+)$/gim, "<li class=\"ml-4\">$2</li>")
        .replace(/^\d+\.\s+(.+)$/gim, "<li class=\"ml-4\">$1</li>")
        .replace(/^(.+)$/gm, (match) => {
            if (match.startsWith("<")) return match;
            return `<p class="my-4 font-serif leading-relaxed">${match}</p>`;
        });
}
