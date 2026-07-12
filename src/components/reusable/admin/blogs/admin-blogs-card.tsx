import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Post, PostDelete } from "@/types/blogs";
import { TypeBadge } from "./type-badge";
import DropdownBlogs from "./dropdown-blogs";
import { Icons } from "@/components/icons";
import { ImageIcon } from "lucide-react";

interface AdminBlogsCardProps {
  post: Post;
  onDelete: (data: PostDelete) => void;
  onToggleFeatured?: (post: Post) => void;
  href: "blogs" | "writings";
}

export function AdminBlogsCard({ post, onDelete, onToggleFeatured, href }: AdminBlogsCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 h-full">
      <CardHeader className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs" variant={"outline"}>
              {post.status}
            </Badge>
            {post.type && <TypeBadge type={post.type} />}
            {post.featured && (
              <Badge variant="outline" className="text-warning border-warning">
                <Icons.Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFeatured?.(post)}
            className="h-8 w-8 p-0"
          >
            {post.featured ? (
              <Icons.Star className="h-4 w-4 fill-current text-warning" />
            ) : (
              <Icons.StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          <DropdownBlogs
            post={{ slug: post.slug, title: post.title }}
            href={href}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Cover Image */}
        {post.coverImage ? (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        ) : (
          <div className="mb-4 rounded-lg overflow-hidden bg-muted flex items-center justify-center aspect-video">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Category */}
        {post.category && (
          <div className="mb-3">
            <Badge
              variant="outline"
              style={{
                borderColor: post.category.color || undefined,
                color: post.category.color || undefined,
              }}
            >
              {post.category.name}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  color: tag.color || undefined,
                  borderColor: tag.color || undefined,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Icons.Eye className="h-3 w-3" />
              {post.viewCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Icons.Clock className="h-3 w-3" />
              {post.readingTime} min
            </div>
          </div>

          {post.createdAt && (
            <div className="flex text-sm items-center gap-1">
              <Icons.Calendar className="h-3 w-3" />
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
