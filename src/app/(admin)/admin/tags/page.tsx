"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tags as TagsIcon,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminTag } from "@/hooks/react-query/admin/tag/use-query";
import { useFormattedDate } from "@/hooks/use-formatted-date";
import { Tag } from "@/types/tags";
import {
  useCreateTag,
  useDeleteTag,
  useUpdateTag,
} from "@/hooks/react-query/admin/tag/use-mutation";
import { useQueryClient } from "@tanstack/react-query";
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
import LoadingState from "@/components/reusable/state/loading-state";
import AdminTagsSkeleton from "@/components/reusable/skeleton/AdminTagsSkeleton";
import { Icons } from "@/components/icons";

export default function Page() {
  const { data, isLoading: isLoadingData } = useAdminTag();

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
  });

  const filteredTags = data?.data?.filter((tag: Tag) =>
    tag?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { mutate: createTag } = useCreateTag({
    onSuccess: (body) => {
      toast.success("Created", {
        description: `Tag ${body.data.name} created successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.tag"] });
    },
  });

  const { mutate: deleteTag, isPending: isLoadingDelete } = useDeleteTag({
    onSuccess: (body) => {
      toast.success("Deleted", {
        description: `Tag ${body.data.name} deleted successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.tag"] });
    },
  });

  const { mutate: updateTag } = useUpdateTag({
    id: editingTag?.id,
    onSuccess: (body) => {
      toast.success("Updated", {
        description: `Tag ${body.data.name} updated successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.tag"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTag) {
      updateTag(formData);
    } else {
      createTag(formData);
    }

    setIsDialogOpen(false);
    setEditingTag(null);
    setFormData({ name: "", color: "#3B82F6" });
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    // setTags((prev) => prev.filter((tag) => tag.id !== id));
    deleteTag({ id });
  };

  const openCreateDialog = () => {
    setEditingTag(null);
    setFormData({ name: "", color: "#000000" });
    setIsDialogOpen(true);
  };

  // Get popular tags for the stats section
  const popularTags = [...(data?.data ?? [])]
    .sort((a, b) => b._count.posts - a._count.posts)
    .slice(0, 6);

  return (
    <LoadingState data={!isLoadingData} loadingFallback={<AdminTagsSkeleton />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Tags</h2>
            <p className="text-muted-foreground mt-1">
              Manage your content tags
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className=" hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] font-mono">
              <DialogHeader>
                <DialogTitle>
                  {editingTag ? "Edit Tag" : "Create New Tag"}
                </DialogTitle>
                <DialogDescription>
                  {editingTag
                    ? "Update the tag information below."
                    : "Fill out the form below to create a new tag."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter tag name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                        className="w-16 h-10 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className=" hover:opacity-90">
                    {editingTag ? "Update" : "Create"} Tag
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Popular Tags Overview */}
        <Card className="bg-admin-card border-admin-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-success" />
              <span>Popular Tags</span>
            </CardTitle>
            <CardDescription>Most used tags in your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularTags?.map((tag: Tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm font-medium"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: `${tag.color}40`,
                  }}
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag.name} ({tag._count.posts})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags Table */}
        <Card className="bg-admin-card border-admin-border shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TagsIcon className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>All Tags</CardTitle>

                  <CardDescription>
                    {data?.data?.length ?? 0} tags total
                  </CardDescription>
                </div>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags?.map((tag: Tag) => (
                  <TableRow
                    key={tag.id}
                    className="hover:bg-admin-sidebar-active/20"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <Badge
                          variant="secondary"
                          className="px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            borderColor: `${tag.color}40`,
                          }}
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {tag.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      /{tag.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-admin-sidebar-active text-foreground"
                      >
                        {tag._count.posts} posts
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {useFormattedDate(tag.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tag)}
                          className="hover:bg-admin-sidebar-active"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <LoadingState
                                loadingFallback={
                                  <Icons.Loader className="animate-spin" />
                                }
                                data={!isLoadingDelete}
                              >
                                <Trash2 className="w-4 h-4" />
                              </LoadingState>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="font-mono">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your project and remove your{" "}
                                <span className="font-bold">{tag.name}</span>{" "}
                                from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className={buttonVariants({
                                  variant: "destructive",
                                })}
                                onClick={() => handleDelete(tag.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LoadingState>
  );
}
