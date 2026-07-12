"use client";
import LoadingState from "@/components/reusable/state/loading-state";
import { AdminProjectsSkeleton } from "@/components/reusable/skeleton/AdminProjectsSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/react-query/admin/dashboard/use-query";
import { formattedDate } from "@/hooks/use-formatted-date";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Folder,
  Hash,
  LayoutDashboard,
  NotebookText,
  Plus,
  Projector,
  Eye,
  Layers,
} from "lucide-react";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  PLANNING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  ON_HOLD: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function Page() {
  const { data, isLoading } = useAdminDashboard();

  const stats = [
    {
      title: "Total Projects",
      value: data?.count?.project ?? 0,
      icon: Projector,
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      title: "Total Blogs",
      value: data?.count?.blog ?? 0,
      icon: BookOpen,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      title: "Total Writings",
      value: data?.count?.writing ?? 0,
      icon: NotebookText,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      title: "Categories",
      value: data?.count?.category ?? 0,
      icon: Layers,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    {
      title: "Tags",
      value: data?.count?.tag ?? 0,
      icon: Hash,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
    {
      title: "Total Views",
      value: data?.totalViews ?? 0,
      icon: Eye,
      color: "text-highlight",
      bg: "bg-highlight/10",
    },
  ];

  const quickActions = [
    {
      label: "New Blog",
      href: "/admin/blogs/create",
      icon: BookOpen,
    },
    {
      label: "New Project",
      href: "/admin/project/create",
      icon: Projector,
    },
    {
      label: "New Writing",
      href: "/admin/writings/create",
      icon: NotebookText,
    },
    {
      label: "Manage Tags",
      href: "/admin/tags",
      icon: Hash,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Overview of your portfolio content
          </p>
        </div>
      </div>

      <LoadingState
        data={!isLoading}
        loadingFallback={<AdminProjectsSkeleton />}
      >
        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="transition-all duration-300 hover:shadow-card"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Projector className="h-5 w-5 text-brand" />
                  Recent Projects
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/project">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>Latest 3 projects</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.recentProjects?.length > 0 ? (
                <div className="space-y-3">
                  {data.recentProjects.map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/admin/project/${project.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formattedDate(project.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`ml-3 shrink-0 text-xs ${statusStyles[project.status] || ""}`}
                      >
                        {project.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No projects yet</p>
                  <Button variant="link" size="sm" asChild className="mt-1">
                    <Link href="/admin/project/create">Create your first project</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-chart-2" />
                  Recent Posts
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/blogs">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>Latest 3 blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.recentPosts?.length > 0 ? (
                <div className="space-y-3">
                  {data.recentPosts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/admin/blogs/${post.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formattedDate(post.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`ml-3 shrink-0 text-xs ${statusStyles[post.status] || ""}`}
                      >
                        {post.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No posts yet</p>
                  <Button variant="link" size="sm" asChild className="mt-1">
                    <Link href="/admin/blogs/create">Write your first post</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used admin actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <Link href={action.href}>
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </LoadingState>
    </div>
  );
}
