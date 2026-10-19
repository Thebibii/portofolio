import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo/site";

type ListMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function buildListMetadata({
  title,
  description,
  path,
}: ListMetadataInput): Metadata {
  const pageTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: pageTitle,
      description,
      url: absoluteUrl(path),
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      title: pageTitle,
      description,
      images: ["/profile.png"],
    },
  };
}

type PostMetadataInput = {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "article";
};

export function buildPostMetadata({
  title,
  description,
  path,
  image,
  type,
}: PostMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      ...(type ? { type } : {}),
      images: image ? [{ url: image }] : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      title,
      description,
      images: image ? [image] : ["/profile.png"],
    },
  };
}
