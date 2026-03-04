import {Skeleton} from "@/components/ui/skeleton";

export default function GlobalLoading() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Skeleton className="mb-4 h-10 w-64"/>
            <Skeleton className="mb-8 h-5 w-96"/>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: 6}).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl"/>
                ))}
            </div>
        </div>
    );
}
