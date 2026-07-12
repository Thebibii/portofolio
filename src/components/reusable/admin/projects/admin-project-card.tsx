import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Project } from "@prisma/client";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import DropdownProject from "./dropdown-project";

interface AdminProjectCardProps {
  data: Project;
  onDelete: (data: { id: string; title: string }) => void;
  onToggleFeatured?: (data: Project) => void;
}

const projectStatusColor: Record<string, string> = {
  PLANNING: "border-blue-500 text-blue-500",
  IN_PROGRESS: "border-yellow-500 text-yellow-500",
  COMPLETED: "border-green-500 text-green-500",
  ON_HOLD: "border-orange-500 text-orange-500",
  ARCHIVED: "border-gray-500 text-gray-500",
};

function formatProjectStatus(status: string) {
  switch (status) {
    case "PLANNING": return "Planning";
    case "IN_PROGRESS": return "In Progress";
    case "ON_HOLD": return "On Hold";
    default: return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString();
}

export default function AdminProjectCard({ data, onDelete, onToggleFeatured }: AdminProjectCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 h-full">
      <CardHeader className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={`text-xs ${projectStatusColor[data.status] || ""}`}
            >
              {formatProjectStatus(data.status)}
            </Badge>
            {data.featured && (
              <Badge variant="outline" className="text-warning border-warning">
                <Icons.Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {data.title}
          </h3>
          {data.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {data.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFeatured?.(data)}
            className="h-8 w-8 p-0"
          >
            {data.featured ? (
              <Icons.Star className="h-4 w-4 fill-current text-warning" />
            ) : (
              <Icons.StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          <DropdownProject
            data={{ id: data.id, title: data.title }}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Cover Image */}
        {data.image && data.image.trim() !== "" ? (
          <div className="mb-4 rounded-lg overflow-hidden">
            <Image
              src={data.image}
              alt={data.title}
              className="w-full aspect-video object-cover"
              width={400}
              height={225}
            />
          </div>
        ) : (
          <div className="mb-4 rounded-lg overflow-hidden bg-muted flex items-center justify-center aspect-video">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Technologies */}
        {data.technologies && data.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {data.technologies.slice(0, 3).map((tech: string) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {data.technologies.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{data.technologies.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Demo / Source links */}
        <div className="flex items-center gap-2 mb-4">
          {data.demoUrl && (
            <Button asChild variant="outline" size="sm">
              <Link target="_blank" href={data.demoUrl}>
                <Icons.ExternalLink className="h-3 w-3 mr-1" />
                Demo
              </Link>
            </Button>
          )}
          {data.sourceUrl && (
            <Button asChild variant="outline" size="sm">
              <Link target="_blank" href={data.sourceUrl}>
                <Icons.Github className="h-3 w-3 mr-1" />
                Source
              </Link>
            </Button>
          )}
        </div>

        <Separator className="mb-4" />

        {/* Dates */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {data.startDate && (
              <div className="flex items-center gap-1">
                <Icons.Calendar className="h-3 w-3" />
                {formatDate(data.startDate)}
              </div>
            )}
            {data.endDate && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">&rarr;</span>
                {formatDate(data.endDate)}
              </div>
            )}
          </div>

          {data.createdAt && (
            <div className="flex text-sm items-center gap-1">
              <Icons.Clock className="h-3 w-3" />
              {formatDate(data.createdAt)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
