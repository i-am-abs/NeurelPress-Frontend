"use client";

import {useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {articleApi, userApi} from "@/lib/api";
import {useAuth} from "@/hooks/use-auth";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Skeleton} from "@/components/ui/skeleton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {ArticleCard} from "@/components/article/article-card";
import toast from "react-hot-toast";
import {HiOutlineGlobeAlt, HiOutlinePencilSquare} from "react-icons/hi2";
import type {User} from "@/types";

export function ProfilePageContent({username}: { username: string }) {
    const {user: currentUser} = useAuth();
    const queryClient = useQueryClient();
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    const {data: profile, isLoading} = useQuery({
        queryKey: ["profile", username],
        queryFn: () => userApi.getProfile(username).then((r) => r.data),
    });

    const {data: articles} = useQuery({
        queryKey: ["user-articles", profile?.id],
        queryFn: () =>
            profile ? articleApi.getByAuthor(profile.id, 0, 12).then((r) => r.data) : null,
        enabled: !!profile,
    });

    const {data: followStatus} = useQuery({
        queryKey: ["follow-status", profile?.id],
        queryFn: () =>
            profile && currentUser
                ? userApi.isFollowing(profile.id).then((r) => r.data)
                : null,
        enabled: !!profile && !!currentUser,
    });

    const handleFollow = async () => {
        if (!currentUser || !profile) return;
        try {
            await userApi.toggleFollow(profile.id);
            await queryClient.invalidateQueries({queryKey: ["profile", username]});
            await queryClient.invalidateQueries({queryKey: ["follow-status", profile.id]});
            toast.success(followStatus?.following ? "Unfollowed" : "Following!");
        } catch {
            toast.error("Failed");
        }
    };

    const openEdit = () => {
        setEditForm({
            displayName: profile?.displayName ?? "",
            headline: profile?.headline ?? "",
            bio: profile?.bio ?? "",
            avatarUrl: profile?.avatarUrl ?? "",
            githubUrl: profile?.githubUrl ?? "",
            linkedinUrl: profile?.linkedinUrl ?? "",
            websiteUrl: profile?.websiteUrl ?? "",
            techTags: profile?.techTags ?? "",
        });
        setEditOpen(true);
    };

    const handleSaveProfile = async () => {
        const {githubUrl, linkedinUrl, websiteUrl} = editForm;

        const isValidUrl = (value?: string | null, mustContain?: string) => {
            if (!value) return true;
            const v = value.trim();
            if (!v) return true;
            if (!/^https?:\/\//i.test(v)) return false;
            return mustContain ? v.toLowerCase().includes(mustContain) : true;
        };

        if (!isValidUrl(githubUrl, "github.com")) {
            toast.error("GitHub URL should start with https:// and contain github.com");
            return;
        }
        if (!isValidUrl(linkedinUrl, "linkedin.com")) {
            toast.error("LinkedIn URL should start with https:// and contain linkedin.com");
            return;
        }
        if (!isValidUrl(websiteUrl)) {
            toast.error("Website URL should start with http:// or https://");
            return;
        }

        try {
            await userApi.updateProfile(editForm);
            await queryClient.invalidateQueries({queryKey: ["profile", username]});
            toast.success("Profile updated");
            setEditOpen(false);
        } catch {
            toast.error("Failed to update profile");
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full"/>
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-48"/>
                        <Skeleton className="h-5 w-72"/>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">User not found.</p>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            {/* Profile Header */}
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatarUrl || undefined}/>
                    <AvatarFallback className="text-2xl">
                        {profile.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                    {profile.headline && (
                        <p className="mt-1 text-sm font-medium text-muted-foreground">{profile.headline}</p>
                    )}
                    {profile.bio && (
                        <p className="mt-2 text-sm">{profile.bio}</p>
                    )}
                    {profile.techTags && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {profile.techTags.split(",").map((t) => t.trim()).filter(Boolean).join(" · ")}
                        </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {(profile.publishedArticleCount ?? 0).toLocaleString()}
            </span>{" "}
                        posts
                        <span className="font-medium text-foreground">
              {(profile.followersCount ?? 0).toLocaleString()}
            </span>{" "}
                        followers
                        <span className="font-medium text-foreground">
              {(profile.followingCount ?? 0).toLocaleString()}
            </span>{" "}
                        following
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                        {profile.websiteUrl && (
                            <a
                                href={profile.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                <HiOutlineGlobeAlt className="h-4 w-4"/>
                                Website
                            </a>
                        )}
                        {profile.githubUrl && (
                            <a
                                href={profile.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                            >
                                GitHub
                            </a>
                        )}
                        {profile.linkedinUrl && (
                            <a
                                href={profile.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                            >
                                LinkedIn
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isOwnProfile && (
                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={openEdit} className="gap-1">
                                    <HiOutlinePencilSquare className="h-4 w-4"/>
                                    Edit profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Edit profile</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Identity</label>
                                        <Input
                                            placeholder="Display name"
                                            value={editForm.displayName ?? ""}
                                            onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                                        />
                                        <Input
                                            placeholder="Avatar URL"
                                            value={editForm.avatarUrl ?? ""}
                                            onChange={(e) => setEditForm({...editForm, avatarUrl: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Authority</label>
                                        <Input
                                            placeholder="Headline"
                                            value={editForm.headline ?? ""}
                                            onChange={(e) => setEditForm({...editForm, headline: e.target.value})}
                                        />
                                        <Textarea
                                            placeholder="Bio"
                                            value={editForm.bio ?? ""}
                                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                            rows={3}
                                        />
                                        <Input
                                            placeholder="Tech tags (e.g. ML, Python, React)"
                                            value={editForm.techTags ?? ""}
                                            onChange={(e) => setEditForm({...editForm, techTags: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Links</label>
                                        <Input
                                            placeholder="GitHub URL"
                                            value={editForm.githubUrl ?? ""}
                                            onChange={(e) => setEditForm({...editForm, githubUrl: e.target.value})}
                                        />
                                        <Input
                                            placeholder="LinkedIn URL"
                                            value={editForm.linkedinUrl ?? ""}
                                            onChange={(e) => setEditForm({...editForm, linkedinUrl: e.target.value})}
                                        />
                                        <Input
                                            placeholder="Website URL"
                                            value={editForm.websiteUrl ?? ""}
                                            onChange={(e) => setEditForm({...editForm, websiteUrl: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSaveProfile}>Save</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    {!isOwnProfile && currentUser && (
                        <Button
                            variant={followStatus?.following ? "outline" : "default"}
                            onClick={handleFollow}
                        >
                            {followStatus?.following ? "Following" : "Follow"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Articles */}
            <div className="mt-12">
                <Tabs defaultValue="published">
                    <TabsList>
                        <TabsTrigger value="published">Published Posts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="published" className="mt-6">
                        {articles?.content.length === 0 ? (
                            <p className="py-12 text-center text-muted-foreground">
                                No published articles yet.
                            </p>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {articles?.content.map((article) => (
                                    <ArticleCard key={article.id} article={article}/>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
