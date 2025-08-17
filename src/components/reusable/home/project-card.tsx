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
import Link from "next/link";
export default function ProjectCard({ data }: { data: any }) {
  return (
    <>
      {data?.map((item: any) => (
        <Card className="w-full font-mono " key={item?.slug}>
          <CardHeader className="space-y-1">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-md bg-gray-100 ">
              <img
                src={
                  item?.image && item.image.trim() !== ""
                    ? item.image
                    : "https://via.placeholder.com/400x225?text=No+Image"
                }
                alt={item?.title || "No image available"}
                className="h-full w-full object-cover"
              />
            </div>
            <CardTitle className="text-lg">{item?.title}</CardTitle>
            <CardDescription className="space-y-2">
              <p>{item?.description}</p>
              <div className="flex flex-wrap space-x-2">
                {item?.technologies.slice(0, 3).map((tech: string) => (
                  <Badge key={tech} variant={"outline"}>
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
                <Button asChild variant="outline">
                  <Link target="_blank" href={item.demoUrl} className="text-sm">
                    <Icons.ExternalLink className="size-4" />
                    Link Demo
                  </Link>
                </Button>
              )}

              {item.sourceUrl && (
                <Button asChild variant="outline" size="icon">
                  <Link
                    target="_blank"
                    href={item.sourceUrl}
                    className="text-sm"
                  >
                    <Icons.Github />
                    Repository
                  </Link>
                </Button>
              )}
            </div>
            <Button asChild className="bg-primary/90">
              <Link href={`/projects/${item.slug}`}>View detail</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
