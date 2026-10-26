import { BookOpen, Rocket, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyStateContent } from "./empty-state";

export type EmptyPresetProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  variant?: "default" | "admin";
  className?: string;
};

/** Empty block for project lists, default icon `Rocket`. */
export function EmptyProjects({ icon = Rocket, ...props }: EmptyPresetProps) {
  return <EmptyStateContent icon={icon} {...props} />;
}

/** Empty block for blog/writing post lists, default icon `BookOpen`. */
export function EmptyPosts({ icon = BookOpen, ...props }: EmptyPresetProps) {
  return <EmptyStateContent icon={icon} {...props} />;
}
