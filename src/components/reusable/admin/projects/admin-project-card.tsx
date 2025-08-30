import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import DeleteProject from "./delete-project";
import { Project } from "@prisma/client";
import Image from "next/image";
export default function AdminProjectCard({ data }: { data: Project[] }) {
  return (
    <>
      {data?.map((item) => (
        <Card className="w-full max-w-sm" key={item?.id}>
          <div className="aspect-[16/9] w-full overflow-hidden  bg-gray-100">
            {item?.image && item.image.trim() !== "" ? (
              <Image
                src={item.image}
                alt={item?.title || "Image"}
                className="h-full w-full object-cover"
                width={400}
                height={225}
              />
            ) : (
              <span className="text-gray-500 font-bold">400 x 225</span>
            )}
          </div>
          <Separator orientation="horizontal" />
          <CardHeader>
            <CardTitle className="text-lg">{item?.title}</CardTitle>
            <CardDescription className="space-y-2">
              <p>{item?.description}</p>
              <div className="flex space-x-2">
                <Badge variant={"outline"}>{item?.status}</Badge>
                {/* start - end */}
              </div>
              <div className="flex flex-wrap space-x-2">
                {item?.technologies.slice(0, 3).map((tech: string) => (
                  <Badge key={tech} variant={"secondary"}>
                    {tech}
                  </Badge>
                ))}
                {item?.technologies.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item?.technologies.length - 3}
                  </Badge>
                )}
              </div>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-row justify-between">
            <div className="flex flex-row space-x-2">
              {item.demoUrl && (
                <Button asChild variant="outline" size="icon">
                  <Link target="_blank" href={item.demoUrl}>
                    <Icons.ExternalLink />
                  </Link>
                </Button>
              )}

              {item.sourceUrl && (
                <Button asChild variant="outline" size="icon">
                  <Link target="_blank" href={item.sourceUrl}>
                    <Icons.Github />
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex flex-row space-x-2">
              <Button asChild variant={"outline"} size={"icon"}>
                <Link href={`/admin/project/${item.id}`}>
                  <Icons.Edit />
                </Link>
              </Button>
              <DeleteProject data={{ id: item.id, title: item.title }} />
            </div>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
