import { blogHooks } from "../use-admin-posts";

export { useToggleFeaturedPost } from "../posts/use-featured";

export const useCreateBlog = blogHooks.useCreate;
export const useUpdateBlog = blogHooks.useUpdate;
export const useDeleteBlog = blogHooks.useDelete;
