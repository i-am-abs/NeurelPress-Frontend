import type { NextRequest } from "next/server";

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function GET(_req: NextRequest) {
  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}/feed/rss`, {
      // RSS should be fresh but we can allow short caching
      next: { revalidate: 60 },
    });

    const body = await res.text();

    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch (e) {
    return new Response(
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version=\"2.0\"><channel><title>NeuralPress</title><description>RSS feed unavailable</description></channel></rss>",
      {
        status: 503,
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
        },
      },
    );
  }
}

