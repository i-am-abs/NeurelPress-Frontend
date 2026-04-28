"use client";

import {Suspense, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {SocialAuthButtons} from "@/components/shared/social-auth-buttons";
import {useAuthStore} from "@/store/auth-store";
import {authApi} from "@/lib/api";
import {getApiErrorMessage} from "@/lib/api-error";
import toast from "react-hot-toast";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
    oauth_email_registered:
        "This email already uses password sign-in. Log in with your email and password instead.",
    oauth_provider_mismatch:
        "This email is linked to a different social provider. Use that provider to sign in.",
    oauth_email_required:
        "We could not read an email from your account. For GitHub, ensure a public email is set on your profile.",
};

function LoginPageContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"password" | "otp">("password");
    const [otp, setOtp] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [oauthBanner, setOauthBanner] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((s) => s.login);

    useEffect(() => {
        const code = searchParams.get("error");
        if (code && OAUTH_ERROR_MESSAGES[code]) {
            setOauthBanner(OAUTH_ERROR_MESSAGES[code]);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let data;
            if (mode === "password") {
                const res = await authApi.login({email, password});
                data = res.data;
                toast.success("Welcome back!");
            } else {
                const res = await authApi.loginWithOtp({email, otp});
                data = res.data;
                toast.success("Logged in with OTP");
            }
            login(data.user, data.accessToken, data.refreshToken);
            router.push("/dashboard");
        } catch (err: unknown) {
            const message = getApiErrorMessage(
                err,
                mode === "password" ? "Invalid credentials" : "Invalid or expired OTP"
            );
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async () => {
        if (!email) {
            toast.error("Please enter your email first.");
            return;
        }
        try {
            await authApi.requestOtp({email});
            setOtpRequested(true);
            toast.success("If this email is registered, an OTP has been sent.");
        } catch (err: unknown) {
            const message = getApiErrorMessage(err, "Failed to send OTP");
            setError(message);
            toast.error(message);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
            <div className="w-full max-w-[420px] rounded-xl border border-border/80 bg-card p-8 shadow-md">
                <div className="text-center">
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        Sign into NeurelPress
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Welcome back! Please sign in to continue
                    </p>
                </div>

                <div className="mt-8">
                    <SocialAuthButtons separatorText="or"/>
                </div>

                {oauthBanner && (
                    <p
                        className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
                        role="alert"
                    >
                        {oauthBanner}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                            {error}
                        </p>
                    )}

                    <div>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                            <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                                Email address
                            </label>
                            <button
                                type="button"
                                className="text-sm text-primary hover:underline"
                                onClick={() => {
                                    setMode(mode === "password" ? "otp" : "password");
                                    setError(null);
                                }}
                            >
                                {mode === "password" ? "Use one-time code" : "Use password"}
                            </button>
                        </div>
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11 rounded-lg border-border bg-background"
                            autoComplete="email"
                        />
                    </div>

                    {mode === "password" ? (
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-primary hover:underline"
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <Input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 rounded-lg border-border bg-background"
                                autoComplete="current-password"
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label htmlFor="login-otp" className="text-sm font-medium text-foreground">
                                    One-time code
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRequestOtp}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {otpRequested ? "Resend code" : "Send code"}
                                </button>
                            </div>
                            <Input
                                id="login-otp"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="h-11 rounded-lg border-border bg-background"
                                autoComplete="one-time-code"
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 w-full gap-1 rounded-lg bg-muted text-foreground hover:bg-muted/80"
                        variant="secondary"
                    >
                        {loading ? "Please wait…" : "Continue"}
                        {!loading && <ChevronRight className="size-4 opacity-70" aria-hidden/>}
                    </Button>
                </form>

                <div className="mt-6 rounded-lg bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-foreground hover:underline">
                        Sign up
                    </Link>
                </div>

                <p className="mt-6 text-center text-[11px] text-muted-foreground">
                    Google sign-in uses OAuth 2.0 on your NeurelPress server (same idea as{" "}
                    <a
                        href="https://refine.dev/blog/nextauth-google-github-authentication-nextjs/"
                        className="underline underline-offset-2 hover:text-foreground"
                        target="_blank"
                        rel="noreferrer"
                    >
                        NextAuth + Google
                    </a>
                    , with Spring Security issuing your app tokens).
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading…</p>
                </div>
            }
        >
            <LoginPageContent/>
        </Suspense>
    );
}
