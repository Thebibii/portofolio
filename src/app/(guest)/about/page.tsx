"use client";
import { useGetDataAbout } from "@/hooks/react-query/guest/use-query";
import { formattedDate } from "@/hooks/use-formatted-date";

export default function Page() {
  const { data } = useGetDataAbout();
  console.log(data?.data);

  return (
    <div className="space-y-12 font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <div className="flex flex-col space-y-8 items-center  mx-auto w-full justify-center">
        <div className="space-y-4 items-center justify-center flex flex-col">
          <header className="text-5xl font-bold">About Me</header>
          <p className="transition-colors bg-gradient-to-r from-gray-500/80 via-black to-gray-500/80 bg-clip-text text-transparent">
            A story of growth and discovery
          </p>
        </div>
        <div className="flex flex-col gap-16 md:gap-20 mt-16 w-full">
          {data?.data?.experiences?.map((e: any, _: any) => (
            <div
              className="grid gap-4 md:grid-cols-[260px_1fr] w-full md:gap-8"
              key={_}
            >
              <p className="tracking-wide uppercase self-start py-2 -mt-1 text-sm  font-semibold">
                <span>{formattedDate(e.startDate, "default", "MMM yyyy")}</span>
                <span> - </span>
                <span>{e.endDate ?? "PRESENT"}</span>
              </p>
              <div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{e.position}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span>{e.company}</span>
                    <span> - {e.location}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
