import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { personSchema, websiteSchema } from "@/components/seo/schemas";
import HomeClient from "@/components/home/home-client";
import { getHomeData } from "@/lib/server/get-home-data";

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Home",
  description:
    "Personal portfolio of Habibie Bayezid Wildan (The Bibi), showcasing projects, blogs, and writings",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Home | The Bibi",
    description:
      "Personal portfolio of Habibie Bayezid Wildan (The Bibi), showcasing projects, blogs, and writings",
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

export default async function HomePage() {
  const { projects, blogs } = await getHomeData();

  return (
    <>
      <JsonLd
        schema={personSchema({
          name: "Habibie Bayezid Wildan",
          url: baseUrl,
          image: `${baseUrl}/profile.png`,
          jobTitle: "Developer",
          description: "Personal portfolio of Habibie Bayezid Wildan (The Bibi), showcasing projects, blogs, and writings",
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
      <HomeClient projects={projects} blogs={blogs} />
    </>
  );
}
