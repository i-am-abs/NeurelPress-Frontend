import {ProfilePageContent} from "./profile-page-content";
import type {Metadata} from "next";

interface ProfilePageProps {
    params: { username: string };
}

export async function generateMetadata({params}: ProfilePageProps): Promise<Metadata> {
    const username = decodeURIComponent(params.username).replace("@", "");
    return {
        title: `@${username}`,
        description: `${username}'s profile on NeuralPress`,
    };
}

export default function ProfilePage({params}: ProfilePageProps) {
    const username = decodeURIComponent(params.username).replace("@", "");
    return <ProfilePageContent username={username}/>;
}
