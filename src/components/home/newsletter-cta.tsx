"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {HiOutlineEnvelope} from "react-icons/hi2";
import {useState} from "react";
import toast from "react-hot-toast";

export function NewsletterCta() {
    const [email, setEmail] = useState("");

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Subscribed! Check your inbox.");
        setEmail("");
    };

    return (
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
            <div className="mb-2 flex items-center gap-2">
                <HiOutlineEnvelope className="h-5 w-5 text-primary"/>
                <h3 className="font-semibold">Weekly AI Digest</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
                Get the top engineering stories delivered to your inbox every Monday.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                />
                <Button type="submit" size="sm">
                    Subscribe
                </Button>
            </form>
        </div>
    );
}
