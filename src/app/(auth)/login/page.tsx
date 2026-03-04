"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {SocialAuthButtons} from "@/components/shared/social-auth-buttons";
import {useAuthStore} from "@/store/auth-store";
import {authApi} from "@/lib/api";
import {getApiErrorMessage} from "@/lib/api-error";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"password" | "otp">("password");
    const [otp, setOtp] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let data;
            if (mode === "password") {
                console.log("[Login] password login attempt", {email});
                const res = await authApi.login({email, password});
                data = res.data;
                toast.success("Welcome back!");
            } else {
                console.log("[Login] OTP login attempt", {email});
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
            console.error("[Login] failed", message, err);
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
            console.log("[Login] requesting OTP", {email});
            await authApi.requestOtp({email});
            setOtpRequested(true);
            toast.success("If this email is registered, an OTP has been sent.");
        } catch (err: unknown) {
            const message = getApiErrorMessage(err, "Failed to send OTP");
            setError(message);
            console.error("[Login] request OTP failed", message, err);
            toast.error(message);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div
                className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border/50 bg-card md:grid-cols-2">
                <div
                    className="relative hidden bg-gradient-to-br from-neural-900 via-neural-800 to-neural-700 p-8 md:flex md:flex-col md:justify-end">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"/>
                    <div className="relative">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <span className="text-lg font-bold text-primary-foreground">N</span>
                        </div>
                        <blockquote className="text-lg font-serif italic text-white/90">
                            &ldquo;Artificial intelligence is not a substitute for human intelligence;
                            it is a tool to amplify human creativity and ingenuity.&rdquo;
                        </blockquote>
                        <p className="mt-3 text-sm text-white/60">&mdash; Fei-Fei Li, Computer Scientist</p>
                    </div>
                </div>

                <div className="p-8">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter your credentials to access the platform.
                    </p>

                    <div className="mt-6">
                        <SocialAuthButtons separatorText="or login with email"/>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        <div>
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>
                        {mode === "password" ? (
                            <>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Password</label>
                                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                            Forgot?
                                        </Link>
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Signing in..." : "Log In"}
                                </Button>
                                <button
                                    type="button"
                                    className="w-full text-xs text-primary underline-offset-2 hover:underline"
                                    onClick={() => {
                                        setMode("otp");
                                        setError(null);
                                    }}
                                >
                                    Use one-time code instead
                                </button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">One-time code</label>
                                        <button
                                            type="button"
                                            onClick={handleRequestOtp}
                                            className="text-xs text-primary underline-offset-2 hover:underline"
                                        >
                                            {otpRequested ? "Resend code" : "Send code"}
                                        </button>
                                    </div>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Verifying..." : "Log In with Code"}
                                </Button>
                                <button
                                    type="button"
                                    className="w-full text-xs text-primary underline-offset-2 hover:underline"
                                    onClick={() => {
                                        setMode("password");
                                        setError(null);
                                    }}
                                >
                                    Use password instead
                                </button>
                            </>
                        )}
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary hover:underline">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
