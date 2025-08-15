"use client";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { useAdminProjectById } from "@/hooks/react-query/admin/projects/use-query";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ title: string }>();

  const { data } = useAdminProjectById({ id: params.title });

  return (
    <section className="space-y-4 pt-9 pb-10 lg:pt-12 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <article className="space-y-4 font-mono">
        <h1 className="text-4xl font-bold">{data?.data?.title}</h1>
        <p>{data?.data?.description}</p>
        <Separator orientation="horizontal" />
        <section className=" flex items-center gap-5 flex-wrap">
          <p className="flex text-xs items-center gap-2 mr-auto">
            <Icons.Eye className="size-4" />
            <span>5000 views</span>
          </p>

          {data?.data?.demoUrl && (
            <Link href={data?.data?.demoUrl} className="hover:underline">
              <p className="flex text-xs items-center gap-2">
                <Icons.Github className="size-4" />
                <span>Repository</span>
              </p>
            </Link>
          )}
          {data?.data?.sourceUrl && (
            <Link href={data?.data?.sourceUrl} className="hover:underline">
              <p className="flex text-xs items-center gap-2">
                <Icons.Link className="size-4" />
                <span>Link demo</span>
              </p>
            </Link>
          )}
        </section>
        <Separator orientation="horizontal" />
      </article>
      {data?.data.longDescription && (
        <div dangerouslySetInnerHTML={{ __html: data.data.longDescription }} />
      )}
    </section>
  );
}
