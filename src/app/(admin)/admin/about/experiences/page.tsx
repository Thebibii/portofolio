"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { experiencesSchema } from "@/types/validation/about";
import { useAdminAbout } from "@/hooks/react-query/admin/about/use-query";
import { z } from "zod";
import { ExperienceForm } from "@/components/reusable/admin/about/experience-form";
import {
  useDeleteExperience,
  useUpsertExperiences,
} from "@/hooks/react-query/admin/about/use-mutation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Experience } from "@prisma/client";
import LoadingState from "@/components/reusable/state/loading-state";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  experiences: experiencesSchema,
});

export default function Page() {
  const { data, isLoading } = useAdminAbout();
  const queryClient = useQueryClient();
  const form = useForm<any>({
    resolver: zodResolver(schema),
    values: {
      experiences:
        data?.data?.experiences?.map((exp: Experience) => ({
          dbId: exp.id,
          position: exp.position,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          duration: exp.duration,
          description: exp.description,
        })) ?? [],
    },
  });

  const { mutate } = useUpsertExperiences({
    onSuccess: () => {
      toast.success("Success", {
        description: "Success",
      });
    },
  });

  const { mutate: deleted } = useDeleteExperience({
    onSuccess: () => {
      toast.success("Success", {
        description: "Success",
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.about"] });
    },
  });

  const onSubmit = (values: any) => {
    mutate(values);
  };

  const onRemove = (values: any) => {
    deleted({ id: values });
  };

  const onError = (errors: any) => {
    console.log("❌ Validation errors:", errors);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/about">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Experiences</h2>
            <p className="text-muted-foreground mt-1">
              Manage your professional experiences and career history
            </p>
          </div>
        </div>
      </div>

      <LoadingState
        data={!isLoading}
        loadingFallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <ExperienceForm onRemove={onRemove} />
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </FormProvider>
      </LoadingState>
    </div>
  );
}
