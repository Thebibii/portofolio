import { blogHooks } from "../use-guest-posts";

export const useGetGuestBlogs = blogHooks.useList;
export const useBlogLikeStatus = blogHooks.useLikeStatus;
export const useGuestBlogBySlug = blogHooks.useBySlug;
