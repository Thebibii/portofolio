import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type TProps<T = any> = {
  data?: T[];
  message?: string;
  children: React.ReactNode;
  emptyFallback: React.ReactElement;
};

const EmptyState = <T,>({
  data,
  message,
  children,
  emptyFallback,
}: TProps<T>) => {
  return (
    <>{data !== undefined && data.length > 0 ? children : emptyFallback}</>
  );
};

export default EmptyState;

type EmptyStateContentProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  variant?: "default" | "admin";
  className?: string;
};

/**
 * Presentational empty block. `default` matches the guest empty blocks,
 * `admin` matches the admin list/project empty blocks.
 */
export function EmptyStateContent({
  title,
  description,
  icon: Icon,
  action,
  variant = "default",
  className,
}: EmptyStateContentProps) {
  if (variant === "admin") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-20 text-center",
          className
        )}
      >
        {Icon && <Icon className="h-16 w-16 text-muted-foreground/40 mb-4" />}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {description}
          </p>
        )}
        {action}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/40 mb-3" />}
      <h3 className="font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
      {action}
    </div>
  );
}
