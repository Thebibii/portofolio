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
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostDelete } from "@/types/blogs";
import Link from "next/link";
import { Fragment, useState } from "react";

type DropdownBlogsProps = {
  post: PostDelete;
  onDelete: (data: { slug: string; title: string }) => void;
  href: "blogs" | "writings";
};

type DeleteAlertDialogProps = {
  post: PostDelete;
  openDeleteAlertDialog: boolean | undefined;
  setOpenDeleteAlertDialog: (
    value: React.SetStateAction<boolean>
  ) => void | undefined;
  onDelete: (data: { slug: string; title: string }) => void;
};

export default function DropdownBlogs({
  post,
  onDelete,
  href,
}: DropdownBlogsProps) {
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] = useState(false);
  return (
    <Fragment>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <Icons.MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-mono">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href={`/admin/${href}/${post.slug}`}>
            <DropdownMenuItem>
              <Icons.Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setOpenDeleteAlertDialog(true)}
          >
            <Icons.Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteAlertDialog
        openDeleteAlertDialog={openDeleteAlertDialog}
        setOpenDeleteAlertDialog={setOpenDeleteAlertDialog}
        post={post}
        onDelete={onDelete}
      />
    </Fragment>
  );
}

function DeleteAlertDialog({
  openDeleteAlertDialog,
  setOpenDeleteAlertDialog,
  post,
  onDelete,
}: DeleteAlertDialogProps) {
  const handleSubmit = () => {
    onDelete({ slug: post.slug, title: post.title });
    setOpenDeleteAlertDialog(false);
  };
  return (
    <AlertDialog open={openDeleteAlertDialog}>
      <AlertDialogContent className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            project and remove your{" "}
            <span className="font-bold">{post.title}</span> from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpenDeleteAlertDialog(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={handleSubmit}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
