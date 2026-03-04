"use client";

import {Button} from "@/components/ui/button";

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    isLast: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export function PaginationControls({
                                       page,
                                       totalPages,
                                       isLast,
                                       onPrevious,
                                       onNext,
                                   }: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="outline" disabled={page === 0} onClick={onPrevious}>
                Previous
            </Button>
            <span className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages}
      </span>
            <Button variant="outline" disabled={isLast} onClick={onNext}>
                Next
            </Button>
        </div>
    );
}
