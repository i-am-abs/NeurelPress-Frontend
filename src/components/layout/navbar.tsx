"use client";

import Link from "next/link";
import Image from "next/image";
import {useAuth} from "@/hooks/use-auth";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {ThemeToggle} from "@/components/layout/theme-toggle";
import {HiOutlineMagnifyingGlass, HiOutlinePencilSquare} from "react-icons/hi2";
import {useState} from "react";
import {useRouter} from "next/navigation";

export function Navbar() {
    const {user, isAuthenticated, logout} = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const router = useRouter();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="NeuralPress"
                            width={140}
                            height={36}
                            className="h-9 w-auto"
                            priority
                        />
                    </Link>

                    <div className="hidden items-center gap-4 md:flex">
                        <Link href="/" className="text-sm text-muted-foreground transition hover:text-foreground">
                            Home
                        </Link>
                        <Link href="/explore"
                              className="text-sm text-muted-foreground transition hover:text-foreground">
                            Explore
                        </Link>
                        <Link href="/library"
                              className="text-sm text-muted-foreground transition hover:text-foreground">
                            Library
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {searchOpen ? (
                        <div className="relative">
                            <HiOutlineMagnifyingGlass
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                            <Input
                                autoFocus
                                placeholder="Search articles..."
                                className="w-64 pl-9"
                                onBlur={() => setSearchOpen(false)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") setSearchOpen(false);
                                }}
                            />
                        </div>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                            <HiOutlineMagnifyingGlass className="h-5 w-5"/>
                        </Button>
                    )}

                    <ThemeToggle/>

                    {isAuthenticated && user ? (
                        <>
                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={() => router.push("/write")}
                            >
                                <HiOutlinePencilSquare className="h-4 w-4"/>
                                Write
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName}/>
                                            <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/u/${user.username}`}>Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/write?drafts=true">Drafts</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/bookmarks">Bookmarks</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={() => {
                                        logout();
                                        router.push("/");
                                    }}>
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Get Started</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
