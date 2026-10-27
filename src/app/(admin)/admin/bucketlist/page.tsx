"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Circle,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Trophy,
} from "lucide-react";

import type { BucketItemData } from "@/types/bucketlist";
import { qk } from "@/lib/react-query/keys";
import { formattedDate } from "@/lib/format-date";
import { useAdminBucketlist } from "@/hooks/react-query/admin/bucketlist/use-query";
import {
  useDeleteBucketItem,
  useReorderBucketItems,
} from "@/hooks/react-query/admin/bucketlist/use-mutation";

import LoadingState from "@/components/reusable/state/loading-state";
import EmptyState, {
  EmptyStateContent,
} from "@/components/reusable/state/empty-state";
import BucketItemForm from "@/components/reusable/admin/bucketlist/bucket-item-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function BucketlistSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-4 rounded-lg border border-border p-4"
        >
          <Skeleton className="mt-0.5 h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminBucketlist();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItemData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BucketItemData | null>(null);

  const items = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => a.order - b.order),
    [data?.data]
  );

  const { mutate: reorderItems, isPending: isReordering } =
    useReorderBucketItems({
      onSuccess: (body) => {
        toast.success("Urutan diperbarui", {
          description: body?.message ?? "Urutan impian berhasil diubah",
        });
        queryClient.invalidateQueries({ queryKey: qk.admin.bucketlist });
      },
      onError: (error) => {
        toast.error("Error", {
          description: error.message || "Gagal mengubah urutan",
        });
      },
    });

  const { mutate: deleteItem, isPending: isDeleting } = useDeleteBucketItem({
    onSuccess: (body) => {
      toast.success("Deleted", {
        description: body.message ?? "Impian berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: qk.admin.bucketlist });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Gagal menghapus impian",
      });
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: BucketItemData) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    reorderItems(next.map((entry) => entry.id));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteItem({ id: deleteTarget.id });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Bucket List</h2>
          <p className="mt-1 text-muted-foreground">
            Kelola daftar impian yang ingin Anda wujudkan.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Impian
        </Button>
      </div>

      <LoadingState
        data={!isLoading}
        loadingFallback={<BucketlistSkeleton />}
      >
        <EmptyState
          data={items}
          emptyFallback={
            <EmptyStateContent
              variant="admin"
              icon={Trophy}
              title="Belum ada impian"
              description="Tambahkan impian pertama Anda."
              action={
                <Button onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Impian
                </Button>
              }
            />
          }
        >
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="mt-0.5 shrink-0">
                  {item.completed ? (
                    <CheckCircle2
                      className="h-5 w-5 text-emerald-500"
                      aria-label="Tercapai"
                    />
                  ) : (
                    <Circle
                      className="h-5 w-5 text-muted-foreground"
                      aria-label="Belum tercapai"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-medium break-words",
                      item.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground break-words">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {item.completedAt && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formattedDate(item.completedAt, "default", "MMMM yyyy")}
                      </span>
                    )}
                    {item.images.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {item.images.length} foto
                      </span>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {item.completed ? "Tercapai" : "Belum tercapai"}
                    </Badge>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Naikkan urutan"
                    disabled={index === 0 || isReordering}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Turunkan urutan"
                    disabled={index === items.length - 1 || isReordering}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Edit impian"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    aria-label="Hapus impian"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </EmptyState>
      </LoadingState>

      {/* Create / edit dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
          else setIsFormOpen(true);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Impian" : "Tambah Impian"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Perbarui informasi impian di bawah ini."
                : "Isi detail impian baru yang ingin Anda wujudkan."}
            </DialogDescription>
          </DialogHeader>
          <BucketItemForm
            key={editingItem?.id ?? "create"}
            item={editingItem ?? undefined}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus impian?</DialogTitle>
            <DialogDescription>
              {`"${deleteTarget?.title ?? ""}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
