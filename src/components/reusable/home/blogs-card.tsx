import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
export default function BlogsCard({ data }: { data: any }) {
  return (
    <>
      {data?.map((item: any) => (
        <Card className="w-full font-mono" key={item?.slug}>
          <div className="flex flex-col md:flex-row">
            {/* Gambar - Muncul pertama di mobile, kedua di desktop */}
            <div className="flex-none p-4 flex items-center md:basis-80 order-1 md:order-2">
              <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                {item?.coverImage && item.coverImage.trim() !== "" ? (
                  <Image
                    src={item.coverImage}
                    alt={item?.title || "Image"}
                    className="h-full w-full object-cover"
                    width={400}
                    height={225}
                  />
                ) : (
                  <span className="text-gray-500 font-bold">400 x 225</span>
                )}
              </div>
            </div>

            {/* Konten - Muncul kedua di mobile, pertama di desktop */}
            <div className="flex-1 flex space-y-2  flex-col h-full order-2 md:order-1">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">{item?.title}</CardTitle>
                <CardDescription className=" w-full space-y-2">
                  <p>{item?.excerpt}</p>
                  <div className="flex space-x-2">
                    {item?.tags?.map(({ tag }: { tag: any }) => (
                      <Badge variant={"outline"} key={tag.slug}>
                        {tag?.name}
                      </Badge>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end ">
                {/* Tombol di kiri - lebih natural untuk reading flow */}

                {/* Stats dan Tags di bawah */}
                <div className="flex items-center flex-wrap space-y-2 sm:space-y-0">
                  <div className="flex flex-row space-x-4 mr-auto">
                    <p className="flex items-center space-x-2 text-xs">
                      <Icons.Clock className="size-3" />
                      <span>{item?.readingTime} min read</span>
                    </p>
                    <p className="flex items-center space-x-2 text-xs">
                      <Icons.Eye className="size-3" />
                      <span>{item?.viewCount} views</span>
                    </p>
                  </div>
                  <div className="">
                    <Button asChild size="sm" className="bg-primary/90">
                      <Link href={`/blogs/${item.slug}`}>
                        Baca selengkapnya
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
