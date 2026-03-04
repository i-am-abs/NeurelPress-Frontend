"use client";

import {Suspense, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {authApi} from "@/lib/api";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Missing verification token.");
            return;
        }

        authApi
            .verifyEmail(token)
            .then(() => {
                setStatus("success");
                setMessage("Your email has been verified. You can now use your account.");
            })
            .catch(() => {
                setStatus("error");
                setMessage("Invalid or expired verification link. You can request a new one from your profile.");
            });
    }, [token]);

    if (status === "loading") {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
                <p className="text-muted-foreground">Verifying your email...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
            <div className="w-full max-w-md rounded-xl border border-border/50 bg-card p-8 text-center">
                {status === "success" ? (
                    <>
                        <div
                            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold">Email Verified</h1>
                        <p className="mt-2 text-muted-foreground">{message}</p>
                        <Button className="mt-6" asChild>
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    </>
                ) : (
                    <>
                        <div
                            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold">Verification Failed</h1>
                        <p className="mt-2 text-muted-foreground">{message}</p>
                        <Button className="mt-6" variant="outline" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><p
            className="text-muted-foreground">Loading...</p></div>}>
            <VerifyEmailContent/>
        </Suspense>
    );
}
