import {Skeleton} from "@/components/ui/skeleton";

interface LoadingGridProps {
    count?: number;
    columns?: "2" | "3";
    itemHeight?: string;
}

export function LoadingGrid({
                                count = 6,
                                columns = "3",
                                itemHeight = "h-64",
                            }: LoadingGridProps) {
    const colsClass =
        columns === "2"
            ? "grid gap-6 sm:grid-cols-2"
            : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

    return (
        <div className={colsClass}>
            {Array.from({length: count}).map((_, i) => (
                <Skeleton key={i} className={`${itemHeight} rounded-xl`}/>
            ))}
        </div>
    );
}
