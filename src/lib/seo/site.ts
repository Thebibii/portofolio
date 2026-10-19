export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thebibie.vercel.app";

export const SITE_NAME = "The Bibi";

export const DEFAULT_OG_IMAGE = {
  url: "/profile.png",
  width: 1080,
  height: 1440,
  alt: "The Bibi",
};

export const absoluteUrl = (path: string) =>
  new URL(path, SITE_URL).toString();
