import FormEditProject from "@/components/reusable/admin/projects/form-edit-project";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FormEditProject id={id} />;
}
