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
import { Project } from "@prisma/client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface SearchProjectProps {
  projects?: Project[];
  onSearchResults?: (filteredProjects: Project[]) => void;
}

export default function SearchProject({
  projects = [],
  onSearchResults,
}: SearchProjectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique statuses from projects
  const availableStatuses = Array.from(
    new Set(projects.map((project) => project.status))
  );

  // Filter projects based on search term and status
  useEffect(() => {
    if (!projects.length || !onSearchResults) return;

    let filteredProjects = projects;

    // Filter by search term
    if (searchTerm.trim()) {
      filteredProjects = filteredProjects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filteredProjects = filteredProjects.filter(
        (project) => project.status === statusFilter
      );
    }

    onSearchResults(filteredProjects);
  }, [searchTerm, statusFilter, projects, onSearchResults]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "PLANNING":
        return "Planning";
      case "IN_PROGRESS":
        return "In Progress";
      case "ON_HOLD":
        return "On Hold";
      default:
        return status;
    }
  };

  const hasActiveFilters = searchTerm.trim() || statusFilter !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Icons.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <Icons.Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="font-mono">
            <SelectItem value="all">All Status</SelectItem>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {formatStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="px-2"
          >
            <Icons.X className="h-4 w-4" />
          </Button>
        )}

        <Button asChild>
          <Link href="/project/create">
            <Icons.Plus className="h-4 w-4" />
            Create
          </Link>
        </Button>
      </div>
    </div>
  );
}
