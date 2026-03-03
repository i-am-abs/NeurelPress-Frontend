import type { IconType } from "react-icons";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: IconType;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-6 w-6 text-primary" />}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
