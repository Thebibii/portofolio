"use client";
import { useGetDataAbout } from "@/hooks/react-query/guest/use-query";
import { formattedDate } from "@/hooks/use-formatted-date";
import LoadingState from "@/components/reusable/state/loading-state";
import { CurrentActivitySkeleton } from "@/components/reusable/skeleton/CurrentActivitySkeleton";
import { ExperienceSkeleton } from "@/components/reusable/skeleton/ExperienceSkeleton";
import { BriefcaseBusiness, CircleHelpIcon, List } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Page() {
  const { data, isLoading, isError, error } = useGetDataAbout();

  if (isError && error) {
    toast.error("Gagal memuat data", {
      description: error.message,
      id: "about-error",
    });
  }

  return (
    <div className="space-y-12 font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <div className="flex flex-col space-y-8 items-center  mx-auto w-full justify-center">
        <div className="space-y-4 items-center justify-center flex flex-col">
          <header className="text-5xl h1">About Me</header>
          <p className="transition-colors bg-gradient-to-r from-gray-500/80 via-black to-gray-500/80 bg-clip-text text-transparent">
            A story of growth and discovery
          </p>
        </div>
        <div className="flex flex-col gap-16 md:gap-20 mt-16 w-full">
          <LoadingState
            data={!isLoading && !isError}
            loadingFallback={
              <div className="flex flex-col gap-16">
                <CurrentActivitySkeleton />
                <ExperienceSkeleton />
              </div>
            }
          >
            {data?.data?.currentActivity?.length > 0 && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-center flex-col gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-300 via-gray-400 to-gray-300" />
                    <div className="relative size-11 rounded-xl flex items-center justify-center bg-gray-100/95 backdrop-blur-md m-[1px]">
                      <CircleHelpIcon
                        className="size-[45%] text-muted-foreground"
                        strokeWidth={1.3}
                      />
                    </div>
                  </div>
                  <h2 className="text-center">Current Activities</h2>
                </div>
                {data?.data?.currentActivity?.map((item: any, idx: number) => (
                  <div
                    className="grid gap-4 md:grid-cols-[260px_1fr] w-full md:gap-8"
                    key={idx}
                  >
                    <p className="tracking-wide uppercase self-start py-2 -mt-1 text-sm font-semibold">
                      {idx + 1}. {item.title}
                    </p>
                    <div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center flex-col gap-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-300 via-gray-400 to-gray-300" />
                <div className="relative size-11 rounded-xl flex items-center justify-center bg-gray-100/95 backdrop-blur-md m-[1px]">
                  <BriefcaseBusiness
                    className="size-[45%] text-muted-foreground"
                    strokeWidth={1.3}
                  />
                </div>
              </div>
              <h2 className="text-center">Experiences</h2>
            </div>

            {data?.data?.experiences?.map((e: any, _: any) => (
              <div
                className="grid gap-4 md:grid-cols-[260px_1fr] w-full md:gap-8"
                key={_}
              >
                <p className="tracking-wide uppercase self-start py-2 -mt-1 text-sm font-semibold">
                  <span>
                    {formattedDate(e.startDate, "default", "MMM yyyy")}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">{" - "}</span>
                      </TooltipTrigger>
                      {e.duration && (
                        <TooltipContent>
                          <p>{e.duration}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <span>
                    {e.endDate
                      ? formattedDate(e.endDate, "default", "MMM yyyy")
                      : "PRESENT"}
                  </span>
                </p>
                <div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{e.position}</h3>
                      <p className="text-sm flex items-center gap-1.5">
                        <span className="text-secondary-foreground/70 font-semibold">
                          {e.company}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          - {e.location}
                        </span>
                      </p>
                    </div>
                    {e.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </LoadingState>
        </div>
      </div>
    </div>
  );
}
