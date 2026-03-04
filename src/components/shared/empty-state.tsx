import {Button} from "@/components/ui/button";
import type {IconType} from "react-icons";

interface EmptyStateProps {
    icon?: IconType;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
                               icon: Icon,
                               title,
                               description,
                               actionLabel,
                               onAction,
                           }: EmptyStateProps) {
    return (
        <div className="py-16 text-center">
            {Icon && (
                <Icon className="mx-auto h-12 w-12 text-muted-foreground/50"/>
            )}
            <p className="mt-4 text-muted-foreground">{title}</p>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>
            )}
            {actionLabel && onAction && (
                <Button variant="outline" className="mt-4" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
