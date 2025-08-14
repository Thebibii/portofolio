"use client";
import { Icons } from "@/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDeleteProject } from "@/hooks/react-query/admin/projects/use-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function DeleteProject({
  data,
}: {
  data: { id: string; title: string };
}) {
  const queryClient = useQueryClient();
  const { mutate } = useDeleteProject({
    onSuccess: (body) => {
      queryClient.invalidateQueries({ queryKey: ["get.admin.projects"] });
      toast.success("Success", {
        description: body.message,
      });
    },
    onError(error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui";

      toast.error("Error", {
        description: message,
      });
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={"destructive"}
          className="cursor-pointer"
          size={"icon"}
        >
          <Icons.Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            project and remove your{" "}
            <span className="font-bold">{data.title}</span> from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => mutate({ id: data.id })}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
