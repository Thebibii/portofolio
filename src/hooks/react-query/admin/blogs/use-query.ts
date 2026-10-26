import { blogHooks, type AdminPostFilters } from "../use-admin-posts";

export type AdminBlogsFilters = AdminPostFilters;

export const useAdminBlogs = blogHooks.useList;
export const useAdminBlogBySlug = blogHooks.useBySlug;
