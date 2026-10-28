import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumbSchema, personSchema } from "@/components/seo/schemas";
import AboutClient from "./_components/about-client";
import {
  getAboutData,
  type AboutProfileData,
} from "@/lib/server/get-about-data";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";

export const revalidate = 3600;

const FALLBACK_NAME = "Habibie Bayezid Wildan";
const FALLBACK_DESCRIPTION =
  "Tentang Habibie Bayezid Wildan (The Bibi), developer yang menulis tentang web, React, dan pengalaman membangun produk.";

function buildDescription(profile: AboutProfileData | null) {
  if (!profile) return FALLBACK_DESCRIPTION;

  const intro = profile.paragraphs?.[0]?.replace(/\s+/g, " ").trim();
  const headline = profile.role
    ? `${profile.name}, ${profile.role}.`
    : profile.name;
  const description = [headline, intro].filter(Boolean).join(" ").trim();

  if (!description) return FALLBACK_DESCRIPTION;
  return description.length > 160
    ? `${description.slice(0, 157).trimEnd()}...`
    : description;
}

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getAboutData();
  const profile = data.profile;
  const description = buildDescription(profile);
  const title = "Tentang Saya";
  const pageTitle = `${title} | ${SITE_NAME}`;
  const image = profile?.photoUrl || null;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/about") },
    openGraph: {
      type: "profile",
      title: pageTitle,
      description,
      url: absoluteUrl("/about"),
      images: image
        ? [{ url: image, alt: `Foto ${profile?.name ?? FALLBACK_NAME}` }]
        : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: image ? [image] : ["/profile.png"],
    },
  };
}

export default async function AboutPage() {
  const initialData = await getAboutData();
  const profile = initialData.data.profile;
  const description = buildDescription(profile);

  return (
    <>
      <JsonLd
        schema={personSchema({
          name: profile?.name ?? FALLBACK_NAME,
          url: absoluteUrl("/about"),
          image: profile?.photoUrl || `${SITE_URL}/profile.png`,
          jobTitle: profile?.role || "Developer",
          description,
          sameAs: [],
        })}
      />
      <JsonLd
        schema={breadcrumbSchema({
          items: [
            { name: "Beranda", url: SITE_URL },
            { name: "Tentang", url: absoluteUrl("/about") },
          ],
        })}
      />
      <AboutClient initialData={initialData} />
    </>
  );
}
