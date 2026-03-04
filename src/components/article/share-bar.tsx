"use client";

import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import toast from "react-hot-toast";

interface ShareBarProps {
    title: string;
    slug: string;
    username: string;
}

export function ShareBar({title, slug, username}: ShareBarProps) {
    const url = `https://neuralpress.dev/u/${username}/${slug}`;

    const share = (platform: string) => {
        const encoded = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const urls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
            linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encoded}`,
            reddit: `https://reddit.com/submit?url=${encoded}&title=${encodedTitle}`,
        };
        if (urls[platform]) window.open(urls[platform], "_blank", "noopener");
    };

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-3">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => share("twitter")}>
                            <span className="text-lg">𝕏</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Share on X</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => share("linkedin")}>
                            <span className="text-lg">in</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Share on LinkedIn</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => share("reddit")}>
                            <span className="text-lg">r/</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Share on Reddit</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={copyLink}>
                            <span className="text-lg">🔗</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Copy link</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
