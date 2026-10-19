import { PostType } from "@/types/blogs";

export type PostFeatureFlags = {
  like: boolean;
  view: boolean;
  comments: boolean;
  readingTime: boolean;
};

export type PostTypeConfig = {
  type: PostType;
  slug: "blogs" | "writings";
  label: string; // "Blog" | "Writing"
  labelPlural: string; // "Blogs" | "Writings"
  revalidatePaths: string[]; // ["/", "/blogs"] dst.
  notFoundMessage: string;
  detailNotFoundMessage: string;
  adminNotFoundMessage: string;
  adminUpdateMessage: string;
  logTag: string;
  features: PostFeatureFlags;
};

export const POST_TYPE_CONFIG: Record<PostType, PostTypeConfig> = {
  [PostType.BLOG]: {
    type: PostType.BLOG,
    slug: "blogs",
    label: "Blog",
    labelPlural: "Blogs",
    revalidatePaths: ["/", "/blogs"],
    notFoundMessage: "Blog tidak ditemukan",
    detailNotFoundMessage: "Blog not found",
    adminNotFoundMessage: "Blog tidak ditemukan",
    adminUpdateMessage: "Blog berhasil diupdate",
    logTag: "blogs",
    features: { like: true, view: true, comments: false, readingTime: true },
  },
  [PostType.WRITING]: {
    type: PostType.WRITING,
    slug: "writings",
    label: "Writing",
    labelPlural: "Writings",
    revalidatePaths: ["/", "/writings"],
    notFoundMessage: "Writing tidak ditemukan",
    detailNotFoundMessage: "Writing not found",
    adminNotFoundMessage: "Writings tidak ditemukan",
    adminUpdateMessage: "Writings berhasil diupdate",
    logTag: "writings",
    features: { like: true, view: true, comments: false, readingTime: true },
  },
};
