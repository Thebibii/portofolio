"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  currentActivitiesSchema,
  experiencesSchema,
} from "@/types/validation/about";
import { useAdminAbout } from "@/hooks/react-query/admin/about/use-query";
import { z } from "zod";
import { CurrentActivityForm } from "@/components/reusable/admin/about/current-activity-form";
import {
  useDeleteCurrentActivity,
  useUpsertCurrentActivity,
} from "@/hooks/react-query/admin/about/use-mutation";
import { toast } from "sonner";
import { CurrentActivity } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { APIResponse } from "@/types/response";
import LoadingState from "@/components/reusable/state/loading-state";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  currentActivities: currentActivitiesSchema,
});

export default function Page() {
  const { data, isLoading } = useAdminAbout();
  const queryClient = useQueryClient();

  const form = useForm<any>({
    resolver: zodResolver(schema),
    values: {
      currentActivities:
        data?.data?.currentActivities?.map((exp: CurrentActivity) => ({
          dbId: exp.id,
          title: exp.title,
          content: exp.content,
        })) ?? [],
    },
  });

  const { mutate } = useUpsertCurrentActivity({
    onSuccess: (body) => {
      toast.success("Success", {
        description: body.message,
      });
    },
  });

  const { mutate: deleted } = useDeleteCurrentActivity({
    onSuccess: (body: APIResponse) => {
      toast.success("Success", {
        description: body.message,
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.about"] });
    },
  });

  const onSubmit = (values: any) => {
    mutate(values);
  };

  const onRemove = (id: string) => {
    deleted({ id });
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
            <h2 className="text-3xl font-bold text-foreground">
              Current Activities
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage your current activities and ongoing projects
            </p>
          </div>
        </div>
      </div>

      <LoadingState
        data={!isLoading}
        loadingFallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <CurrentActivityForm onRemove={onRemove} />
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </FormProvider>
      </LoadingState>
    </div>
  );
}
