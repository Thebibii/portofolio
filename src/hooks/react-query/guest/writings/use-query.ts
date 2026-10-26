import { writingHooks } from "../use-guest-posts";

export const useGetGuestWritings = writingHooks.useList;
export const useWritingLikeStatus = writingHooks.useLikeStatus;
export const useGuestWritingBySlug = writingHooks.useBySlug;
