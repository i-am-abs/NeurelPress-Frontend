"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import Script from "next/script";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {getOAuthBaseUrl} from "@/lib/constants";
import {authApi} from "@/lib/api";
import {useAuthStore} from "@/store/auth-store";
import {getApiErrorMessage} from "@/lib/api-error";
import {analytics} from "@/lib/analytics";
import {FaGithub} from "react-icons/fa";
import {FcGoogle} from "react-icons/fc";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (cfg: {
                        client_id: string;
                        callback: (resp: { credential: string }) => void;
                        ux_mode?: "popup" | "redirect";
                        auto_select?: boolean;
                    }) => void;
                    prompt: () => void;
                    renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
                };
            };
        };
    }
}

interface SocialAuthButtonsProps {
    separatorText?: string;
}

const githubOAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GITHUB_OAUTH === "true";
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const useGisFlow = Boolean(googleClientId);

export function SocialAuthButtons({separatorText = "or"}: SocialAuthButtonsProps) {
    const oauthBase = getOAuthBaseUrl();
    const router = useRouter();
    const login = useAuthStore((s) => s.login);
    const [scriptReady, setScriptReady] = useState(false);
    const [gisReady, setGisReady] = useState(false);
    const [pending, setPending] = useState(false);
    const initialised = useRef(false);

    const handleCredential = useCallback(
        async (idToken: string) => {
            setPending(true);
            try {
                const {data} = await authApi.googleSignIn(idToken);
                login(data.user, data.accessToken, data.refreshToken);
                void analytics.track({eventName: "auth_login", metadata: {provider: "google"}});
                toast.success("Signed in with Google");
                router.push("/dashboard");
            } catch (err) {
                toast.error(getApiErrorMessage(err, "Google sign-in failed"));
            } finally {
                setPending(false);
            }
        },
        [login, router]
    );

    useEffect(() => {
        if (!useGisFlow || !scriptReady || initialised.current) return;
        if (!window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: ({credential}) => void handleCredential(credential),
            ux_mode: "popup",
            auto_select: false,
        });
        initialised.current = true;
        setGisReady(true);
    }, [scriptReady, handleCredential]);

    const handleGoogleClick = () => {
        if (useGisFlow) {
            if (!gisReady) {
                toast.error("Google sign-in is still loading. Please try again in a moment.");
                return;
            }
            window.google?.accounts?.id.prompt();
            return;
        }
        if (typeof window !== "undefined") {
            const apiConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL);
            if (!apiConfigured && oauthBase === window.location.origin && process.env.NODE_ENV === "production") {
                toast.error(
                    "Google sign-in needs NEXT_PUBLIC_API_URL on Vercel pointing at your public backend (HTTPS)."
                );
                return;
            }
        }
        window.location.href = `${oauthBase}/oauth2/authorization/google`;
    };

    return (
        <>
            {useGisFlow && (
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                    onLoad={() => setScriptReady(true)}
                />
            )}

            <div
                className={
                    githubOAuthEnabled
                        ? "grid grid-cols-2 gap-3"
                        : "grid grid-cols-1 gap-3"
                }
            >
                <Button
                    variant="outline"
                    type="button"
                    disabled={pending || (useGisFlow && !gisReady)}
                    onClick={handleGoogleClick}
                    className="h-11 gap-2 border border-border bg-background font-normal shadow-sm hover:bg-muted/40"
                >
                    <FcGoogle className="size-[18px] shrink-0" aria-hidden/>
                    <span>{pending ? "Signing in…" : "Continue with Google"}</span>
                </Button>

                {githubOAuthEnabled ? (
                    <Button
                        variant="outline"
                        type="button"
                        className="h-11 gap-2 border border-border bg-background font-normal shadow-sm hover:bg-muted/40"
                        asChild
                    >
                        <a href={`${oauthBase}/oauth2/authorization/github`}>
                            <FaGithub className="size-[18px] shrink-0" aria-hidden/>
                            <span>GitHub</span>
                        </a>
                    </Button>
                ) : null}
            </div>

            <div className="my-6 flex items-center gap-3">
                <Separator className="flex-1"/>
                <span className="text-xs font-medium text-muted-foreground">{separatorText}</span>
                <Separator className="flex-1"/>
            </div>
        </>
    );
}
