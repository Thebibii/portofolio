"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { Category, PostStatus, Tag } from "@/types/blogs";
import { useEffect, useState } from "react";

interface SearchContentProps {
  search?: string;
  status?: string;
  categoryId?: string;
  tagId?: string;
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onTagChange?: (value: string) => void;
  onClear?: () => void;
  categories?: Category[];
  tags?: Tag[];
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: PostStatus.DRAFT, label: "Draft" },
  { value: PostStatus.PUBLISHED, label: "Published" },
  { value: PostStatus.ARCHIVED, label: "Archived" },
];

export default function SearchContent({
  search = "",
  status = "",
  categoryId = "",
  tagId = "",
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onTagChange,
  onClear,
  categories = [],
  tags = [],
}: SearchContentProps) {
  const [searchTerm, setSearchTerm] = useState(search);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Keep the input in sync when the URL search value changes externally
  // (back/forward navigation, "Clear all").
  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  // Debounced: only push the keyword up to the URL/query after typing settles.
  useEffect(() => {
    if (debouncedSearchTerm !== search) {
      onSearchChange?.(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const statusValue = status || "all";
  const categoryValue = categoryId || "all";
  const tagValue = tagId || "all";

  const handleStatusChange = (value: string) => {
    onStatusChange?.(value === "all" ? "" : value);
  };

  const handleCategoryChange = (value: string) => {
    onCategoryChange?.(value === "all" ? "" : value);
  };

  const handleTagChange = (value: string) => {
    onTagChange?.(value === "all" ? "" : value);
  };

  const handleClear = () => {
    onClear?.();
  };

  const hasActiveFilters = Boolean(search.trim() || status || categoryId || tagId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icons.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={statusValue} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <Icons.Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="font-mono">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryValue} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="font-mono">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tagValue} onValueChange={handleTagChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent className="font-mono">
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Active filters:</p>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Icons.X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
