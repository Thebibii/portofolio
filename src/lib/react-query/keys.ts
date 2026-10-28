export type PostSlug = "blogs" | "writings";

// Key strings are kept identical to the values that were previously inlined in
// the hooks, so no cache migration is needed.
const ADMIN_POST_LIST_KEY = {
  blogs: "get.admin.blogs",
  writings: "get.admin.writings",
} as const;

const GUEST_POST_LIST_KEY = {
  blogs: "get.guest.blogs",
  writings: "get.guest.writings",
} as const;

// Liked-status keys end with ".liked", NOT with the list key, so a plain
// invalidateQueries({ queryKey: guestPostListKey(...) }) never touches them.
const GUEST_POST_LIKED_KEY = {
  blogs: "get.guest.blogs.liked",
  writings: "get.guest.writings.liked",
} as const;

export const adminPostListKey = <T extends PostSlug>(slug: T) =>
  [ADMIN_POST_LIST_KEY[slug]] as const;

export const adminPostKey = <T extends PostSlug>(slug: T, postSlug: string) =>
  [...adminPostListKey(slug), postSlug] as const;

export const guestPostListKey = <T extends PostSlug>(
  slug: T,
  filters?: unknown
) => [GUEST_POST_LIST_KEY[slug], filters] as const;

export const guestPostKey = <T extends PostSlug>(slug: T, postSlug: string) =>
  [GUEST_POST_LIST_KEY[slug], postSlug] as const;

export const guestPostLikedKey = <T extends PostSlug>(
  slug: T,
  postSlug: string
) => [GUEST_POST_LIKED_KEY[slug], postSlug] as const;

export const qk = {
  admin: {
    about: ["get.admin.about"] as const,
    aboutProfile: ["get.admin.about-profile"] as const,
    dashboard: ["get.admin.dashboard"] as const,
    categories: ["get.admin.category"] as const,
    tags: ["get.admin.tag"] as const,
    bucketlist: ["get.admin.bucketlist"] as const,
    projects: ["get.admin.projects"] as const,
    project: (id: string) => ["get.admin.project", id] as const,
    blogs: ["get.admin.blogs"] as const,
    blog: (slug: string) => ["get.admin.blogs", slug] as const,
    writings: ["get.admin.writings"] as const,
    writing: (slug: string) => ["get.admin.writings", slug] as const,
    /** Prefix key for a post list of any type (partial match on invalidate). */
    posts: adminPostListKey,
    post: adminPostKey,
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
    posts: guestPostListKey,
    post: guestPostKey,
    postLiked: guestPostLikedKey,
    blogs: (filters?: unknown) => guestPostListKey("blogs", filters),
    blog: (slug: string) => guestPostKey("blogs", slug),
    blogLiked: (slug: string) => guestPostLikedKey("blogs", slug),
    writings: (filters?: unknown) => guestPostListKey("writings", filters),
    writing: (slug: string) => guestPostKey("writings", slug),
    writingLiked: (slug: string) => guestPostLikedKey("writings", slug),
    tags: (type: string) => ["get.guest.tags", type] as const,
    category: (type: string) => ["get.guest.category", type] as const,
  },
};
