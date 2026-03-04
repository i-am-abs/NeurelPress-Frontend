import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-4">
                    <div>
                        <Link href="/" className="inline-block">
                            <Image
                                src="/logo.png"
                                alt="NeuralPress — Scientific Publishing Platform"
                                width={160}
                                height={42}
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="mt-3 text-sm text-muted-foreground">
                            The AI engineering publishing platform for deep technical content.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold">Platform</h4>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                            <li><Link href="/explore" className="hover:text-foreground">Explore</Link></li>
                            <li><Link href="/library" className="hover:text-foreground">Library</Link></li>
                            <li><Link href="/write" className="hover:text-foreground">Write</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold">Resources</h4>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                            <li><Link href="/api/feed/rss" className="hover:text-foreground">RSS Feed</Link></li>
                            <li><Link href="/sitemap.xml" className="hover:text-foreground">Sitemap</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold">Legal</h4>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} NeuralPress. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
