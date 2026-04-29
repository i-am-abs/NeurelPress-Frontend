import type {Metadata} from "next";
import {IBM_Plex_Serif, Inter, JetBrains_Mono} from "next/font/google";
import {Providers} from "@/components/providers";
import {Navbar} from "@/components/layout/navbar";
import {Footer} from "@/components/layout/footer";
import {Analytics} from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const ibmPlexSerif = IBM_Plex_Serif({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-ibm-plex-serif",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "NeuralPress — AI Engineering Publishing Platform",
        template: "%s | NeuralPress",
    },
    description:
        "The premier publishing platform for AI engineers, researchers, and practitioners. Deep technical articles, curated book references, and community-driven insights.",
    keywords: [
        "AI", "machine learning", "deep learning", "engineering blog",
        "technical writing", "NLP", "computer vision", "MLOps",
    ],
    authors: [{name: "NeuralPress"}],
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://neuralpress.dev",
        siteName: "NeuralPress",
        title: "NeuralPress — AI Engineering Publishing Platform",
        description: "Deep technical content for AI engineers.",
    },
    twitter: {
        card: "summary_large_image",
        title: "NeuralPress",
        description: "AI Engineering Publishing Platform",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {index: true, follow: true},
    },
    alternates: {
        types: {"application/rss+xml": "/api/feed/rss"},
    },
    icons: {
        icon: "/icon.png",
        apple: "/icon.png",
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${inter.variable} ${ibmPlexSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
        <Providers>
            <div className="flex min-h-screen flex-col">
                <Navbar/>
                <main className="flex-1">{children}</main>
                <Footer/>
            </div>
            <Analytics/>
        </Providers>
        </body>
        </html>
    );
}
