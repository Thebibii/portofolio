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

const schema = z.object({
  currentActivities: currentActivitiesSchema,
});

export default function Page() {
  const { data } = useAdminAbout();
  const queryClient = useQueryClient();

  const form = useForm<any>({
    resolver: zodResolver(schema),
    values: {
      currentActivities:
        data?.data?.currentActivities?.map((exp: CurrentActivity) => ({
          dbId: exp.id, // simpan id asli ke sini
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
  );
}
