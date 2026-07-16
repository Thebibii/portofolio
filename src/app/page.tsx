import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { personSchema, websiteSchema } from "@/components/seo/schemas";
import HomeClient from "@/components/home/home-client";

const baseUrl = "https://thebibie.vercel.app";

export const metadata: Metadata = {
  title: "The Bibi — Portfolio",
  description:
    "Personal portfolio showcasing projects, blogs, and writings by The Bibi",
  openGraph: {
    title: "The Bibi — Portfolio",
    description:
      "Personal portfolio showcasing projects, blogs, and writings by The Bibi",
    url: baseUrl,
    images: [
      {
        url: "/profile.png",
        width: 512,
        height: 512,
        alt: "The Bibi",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        schema={personSchema({
          name: "Bibi",
          url: baseUrl,
          image: `${baseUrl}/profile.png`,
          jobTitle: "Developer",
          description: "Personal portfolio showcasing projects, blogs, and writings",
          sameAs: [],
        })}
      />
      <JsonLd
        schema={websiteSchema({
          name: "The Bibi",
          url: baseUrl,
          description: "Personal portfolio showcasing projects, blogs, and writings",
          searchUrl: `${baseUrl}/search?q={search_term_string}`,
        })}
      />
      <HomeClient />
    </>
  );
}
