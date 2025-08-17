import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PostType } from "@/types/blogs";

interface TypeBadgeProps {
  type: PostType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const getTypeConfig = (type: PostType) => {
    switch (type) {
      case PostType.BLOG:
        return {
          label: "Blog",
          className:
            "bg-type-blog text-primary-foreground hover:bg-type-blog/80",
        };
      case PostType.WRITING:
        return {
          label: "Writing",
          className:
            "bg-type-writing text-success-foreground hover:bg-type-writing/80",
        };
      default:
        return {
          label: "Unknown",
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
