"use client";
import FormEditProject from "@/components/reusable/admin/projects/form-edit-project";
import ProjectFormSkeleton from "@/components/reusable/skeleton/project-form-skeleton";
import LoadingState from "@/components/reusable/state/loading-state";
import { useAdminProjectById } from "@/hooks/react-query/admin/projects/use-query";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useAdminProjectById({ id: params.id });
  return (
    <LoadingState data={!isLoading} loadingFallback={<ProjectFormSkeleton />}>
      {data?.data && <FormEditProject projectData={data.data} id={params.id} />}
    </LoadingState>
  );
}
