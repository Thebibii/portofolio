import type { Metadata } from "next";
import { buildListMetadata } from "@/lib/seo/metadata";
import { getBucketlistData } from "@/lib/server/get-bucketlist-data";
import BucketlistClient from "./_components/bucketlist-client";

export const revalidate = 60;

export const metadata: Metadata = buildListMetadata({
  title: "Daftar Impian",
  description:
    "Daftar impian saya — hal yang ingin dilakukan, tempat yang ingin didatangi, dan mimpi yang sudah tercapai.",
  path: "/bucketlist",
});

export default async function BucketlistPage() {
  const items = await getBucketlistData();

  return <BucketlistClient items={items} />;
}
