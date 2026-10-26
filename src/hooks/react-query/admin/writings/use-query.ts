import { writingHooks, type AdminPostFilters } from "../use-admin-posts";

export type AdminWritingsFilters = AdminPostFilters;

export const useAdminWritings = writingHooks.useList;
export const useAdminWritingBySlug = writingHooks.useBySlug;
