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

  // Guest list copy/behaviour. Kept in config so shared UI never hardcodes
  // "Blog"/"Writing" or branches on the post type.
  listHeading: string;
  listDescription: string;
  searchPlaceholder: string;
  countLabel: string; // noun used in "Menampilkan X dari Y <noun>"
  listEmptyTitle: string;
  listEmptyDescription: string;
  listErrorTitle: string;
  detailBackLabel: string;
  /** Blog cards expose tag/category links; writings keep the static badges. */
  enableCardFilterLinks: boolean;
  /**
   * The Blog list historically rendered an empty tag row, which still adds the
   * parent flex gap when there are no tags. Kept per type so spacing is
   * unchanged on both lists.
   */
  tagRowAlwaysVisible: boolean;

  // Admin copy/behaviour.
  adminCreateTitle: string;
  adminCreateDescription: string;
  adminEditTitle: string;
  adminEditDescription: string;
  adminUploadFolder: string;
  adminEmptyTitle: string;
  adminEmptyDescription: string;
  adminEmptyCta: string;
  adminTotalLabel: string;
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
    listHeading: "Blog",
    listDescription: "Cerita tentang pertumbuhan dan penemuan",
    searchPlaceholder: "Cari blog...",
    countLabel: "blog",
    listEmptyTitle: "Tidak ada blog yang ditemukan",
    listEmptyDescription: "Coba ubah kata kunci pencarian atau filter",
    listErrorTitle: "Gagal memuat blog",
    detailBackLabel: "Kembali ke blog",
    enableCardFilterLinks: true,
    tagRowAlwaysVisible: true,
    adminCreateTitle: "Create New Post",
    adminCreateDescription: "Write and publish a new blog post",
    adminEditTitle: "Edit Blog",
    adminEditDescription: "Write and publish a new blog post",
    adminUploadFolder: "blog/description",
    adminEmptyTitle: "No blogs yet",
    adminEmptyDescription: "Get started by creating your first blog.",
    adminEmptyCta: "Create your first blog",
    adminTotalLabel: "blog",
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
    listHeading: "Tulisan",
    listDescription: "Cerita tentang pertumbuhan dan penemuan",
    searchPlaceholder: "Cari tulisan...",
    countLabel: "tulisan",
    listEmptyTitle: "Tidak ada tulisan yang ditemukan",
    listEmptyDescription: "Coba ubah kata kunci pencarian atau filter",
    listErrorTitle: "Gagal memuat tulisan",
    detailBackLabel: "Kembali ke tulisan",
    enableCardFilterLinks: false,
    tagRowAlwaysVisible: false,
    adminCreateTitle: "Create New Post",
    adminCreateDescription: "Write and publish a new writing post",
    adminEditTitle: "Edit Writing",
    adminEditDescription: "Write and publish a new writing post",
    adminUploadFolder: "writing/description",
    adminEmptyTitle: "No writings yet",
    adminEmptyDescription: "Get started by creating your first writing.",
    adminEmptyCta: "Create your first writing",
    adminTotalLabel: "writing",
  },
};
