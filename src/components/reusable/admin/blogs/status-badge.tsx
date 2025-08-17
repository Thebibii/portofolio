import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PostStatus } from "@/types/blogs";

interface StatusBadgeProps {
  status: PostStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: PostStatus) => {
    switch (status) {
      case PostStatus.PUBLISHED:
        return {
          label: "Published",
          className:
            "bg-status-published text-success-foreground hover:bg-status-published/80",
        };
      case PostStatus.DRAFT:
        return {
          label: "Draft",
          className:
            "bg-status-draft text-warning-foreground hover:bg-status-draft/80",
        };
      case PostStatus.ARCHIVED:
        return {
          label: "Archived",
          className:
            "bg-status-archived text-muted-foreground hover:bg-status-archived/80",
        };
      default:
        return {
          label: "Unknown",
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
