"use client";

import {Suspense, useEffect} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAuthStore} from "@/store/auth-store";
import {authApi} from "@/lib/api";

function AuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((s) => s.login);

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("np_access_token", token);
            authApi
                .me()
                .then((res) => {
                    login(res.data, token, "");
                    router.push("/dashboard");
                })
                .catch(() => router.push("/login"));
        } else {
            router.push("/login");
        }
    }, [searchParams, login, router]);

    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-muted-foreground">Authenticating...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            }
        >
            <AuthCallbackInner/>
        </Suspense>
    );
}
