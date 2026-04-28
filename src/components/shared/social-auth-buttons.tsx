"use client";

import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {getOAuthBaseUrl} from "@/lib/constants";
import {FaGithub} from "react-icons/fa";
import {FcGoogle} from "react-icons/fc";

interface SocialAuthButtonsProps {
    separatorText?: string;
}

const githubOAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GITHUB_OAUTH === "true";

export function SocialAuthButtons({
                                      separatorText = "or",
                                  }: SocialAuthButtonsProps) {
    const oauthBase = getOAuthBaseUrl();

    return (
        <>
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
                    className="h-11 gap-2 border border-border bg-background font-normal shadow-sm hover:bg-muted/40"
                    asChild
                >
                    <a href={`${oauthBase}/oauth2/authorization/google`}>
                        <FcGoogle className="size-[18px] shrink-0" aria-hidden/>
                        <span>Google</span>
                    </a>
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
