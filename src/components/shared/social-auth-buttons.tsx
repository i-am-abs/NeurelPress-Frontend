"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getOAuthBaseUrl } from "@/lib/constants";

interface SocialAuthButtonsProps {
  separatorText?: string;
}

export function SocialAuthButtons({
  separatorText = "or",
}: SocialAuthButtonsProps) {
  const oauthBase = getOAuthBaseUrl();

  return (
    <>
      <div className="space-y-3">
        <Button variant="outline" className="w-full gap-2" asChild>
          <a href={`${oauthBase}/oauth2/authorization/google`}>
            <span className="text-lg">G</span>
            Continue with Google
          </a>
        </Button>
        <Button variant="outline" className="w-full gap-2" asChild>
          <a href={`${oauthBase}/oauth2/authorization/github`}>
            Continue with GitHub
          </a>
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">{separatorText}</span>
        <Separator className="flex-1" />
      </div>
    </>
  );
}
