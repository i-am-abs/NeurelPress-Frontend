import Link from "next/link";
import {Button} from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <p className="mb-2 text-6xl font-bold text-primary">404</p>
            <h2 className="mb-2 text-2xl font-bold">Page not found</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Button asChild>
                <Link href="/">Go home</Link>
            </Button>
        </div>
    );
}
