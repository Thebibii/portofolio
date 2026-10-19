export const qk = {
  admin: {
    about: ["get.admin.about"] as const,
    dashboard: ["get.admin.dashboard"] as const,
    categories: ["get.admin.category"] as const,
    tags: ["get.admin.tag"] as const,
    projects: ["get.admin.projects"] as const,
    project: (id: string) => ["get.admin.project", id] as const,
    blogs: ["get.admin.blogs"] as const,
    blog: (slug: string) => ["get.admin.blogs", slug] as const,
    writings: ["get.admin.writings"] as const,
    writing: (slug: string) => ["get.admin.writings", slug] as const,
  },
  guest: {
    home: ["get.guest"] as const,
    about: ["get.guest.about"] as const,
    statistics: ["get.guest.statistics"] as const,
    featuredBlogs: ["get.guest.featured.blogs"] as const,
    projects: ["get.guest.projects"] as const,
    projectsFiltered: (featured: boolean) =>
      ["get.guest.projects", "filtered", featured] as const,
    project: (slug: string) => ["get.guest.projects", slug] as const,
    blogs: (filters?: unknown) => ["get.guest.blogs", filters] as const,
    blogLiked: (slug: string) => ["get.guest.blogs.liked", slug] as const,
    blog: (slug: string) => ["get.guest.blogs", slug] as const,
    writings: (filters?: unknown) => ["get.guest.writings", filters] as const,
    writingLiked: (slug: string) =>
      ["get.guest.writings.liked", slug] as const,
    writing: (slug: string) => ["get.guest.writings", slug] as const,
    tags: (type: string) => ["get.guest.tags", type] as const,
    category: (type: string) => ["get.guest.category", type] as const,
  },
};
