import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { personSchema, websiteSchema } from "@/components/seo/schemas";
import HomeClient from "@/components/home/home-client";
import { getHomeData } from "@/lib/server/get-home-data";

const baseUrl = "https://thebibie.vercel.app";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Portofolio pribadi Habibie Bayezid Wildan (The Bibi), menampilkan projek, blog, dan tulisan",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Beranda | The Bibi",
    description:
      "Portofolio pribadi Habibie Bayezid Wildan (The Bibi), menampilkan projek, blog, dan tulisan",
    url: baseUrl,
    images: [
      {
        url: "/profile.png",
        width: 1080,
        height: 1440,
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
          description: "Portofolio pribadi Habibie Bayezid Wildan (The Bibi), menampilkan projek, blog, dan tulisan",
          sameAs: [],
        })}
      />
      <JsonLd
        schema={websiteSchema({
          name: "The Bibi",
          url: baseUrl,
          description: "Portofolio pribadi menampilkan projek, blog, dan tulisan",
          searchUrl: `${baseUrl}/search?q={search_term_string}`,
        })}
      />
      <HomeClient projects={projects} blogs={blogs} />
    </>
  );
}
