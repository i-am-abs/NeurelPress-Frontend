import {ProfilePageContent} from "./profile-page-content";
import type {Metadata} from "next";

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({params}: ProfilePageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const username = decodeURIComponent(resolvedParams.username).replace("@", "");
    return {
        title: `@${username}`,
        description: `${username}'s profile on NeuralPress`,
    };
}

export default async function ProfilePage({params}: ProfilePageProps) {
    const resolvedParams = await params;
    const username = decodeURIComponent(resolvedParams.username).replace("@", "");
    return <ProfilePageContent username={username}/>;
}
