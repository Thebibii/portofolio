"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { bucketItemSchema } from "@/types/validation/bucketlist";
import type { BucketItemData, BucketItemFormData } from "@/types/bucketlist";
import { qk } from "@/lib/react-query/keys";
import {
  useCreateBucketItem,
  useUpdateBucketItem,
} from "@/hooks/react-query/admin/bucketlist/use-mutation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultipleImageUploader } from "@/components/ui/image-uploader";

interface BucketItemFormProps {
  /** Item yang diedit. Kosongkan untuk mode create. */
  item?: BucketItemData;
  /** Dipanggil setelah create/update sukses (dipakai untuk menutup dialog). */
  onSuccess?: () => void;
  /** Dipanggil saat tombol batal ditekan. */
  onCancel?: () => void;
}

/** Ambil bagian tanggal (yyyy-MM-dd) dari ISO string untuk input type="date". */
function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export default function BucketItemForm({
  item,
  onSuccess,
  onCancel,
}: BucketItemFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(item);

  const form = useForm({
    resolver: zodResolver(bucketItemSchema),
    defaultValues: {
      title: item?.title ?? "",
      description: item?.description ?? "",
      completed: item?.completed ?? false,
      // Disimpan sebagai ISO string agar lolos validasi bucketItemSchema.
      completedAt: item?.completedAt ?? null,
      images: item?.images ?? [],
    },
  });

  const handleMutationSuccess = (body: { message?: string }) => {
    toast.success(isEditing ? "Updated" : "Created", {
      description:
        body.message ??
        (isEditing
          ? "Impian berhasil diperbarui"
          : "Impian berhasil ditambahkan"),
    });
    queryClient.invalidateQueries({ queryKey: qk.admin.bucketlist });
    onSuccess?.();
  };

  const handleMutationError = (error: Error) => {
    toast.error("Error", {
      description: error.message || "Terjadi kesalahan yang tidak diketahui",
    });
  };

  const { mutate: createItem, isPending: isCreating } = useCreateBucketItem({
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });

  const { mutate: updateItem, isPending: isUpdating } = useUpdateBucketItem({
    id: item?.id ?? "",
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });

  const isPending = isCreating || isUpdating;
  const isCompleted = Boolean(form.watch("completed"));

  const onSubmit = form.handleSubmit((values) => {
    const payload: BucketItemFormData = {
      title: values.title,
      description: values.description ? values.description : null,
      completed: Boolean(values.completed),
      completedAt:
        values.completed && values.completedAt ? values.completedAt : null,
      images: values.images ?? [],
    };

    if (item) {
      updateItem(payload);
    } else {
      createItem(payload);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Menjelajahi Islandia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ceritakan singkat tentang impian ini (opsional)"
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Maksimal 500 karakter.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Sudah tercapai</FormLabel>
                <FormDescription>
                  Tandai jika impian ini sudah Anda wujudkan.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue("completedAt", null);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="completedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal tercapai</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(event) => {
                    const value = event.target.value;
                    // API meminta ISO datetime; input memberi yyyy-MM-dd.
                    field.onChange(
                      value ? new Date(value).toISOString() : null
                    );
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  disabled={!isCompleted}
                />
              </FormControl>
              <FormDescription>
                {isCompleted
                  ? "Tanggal kapan impian ini tercapai."
                  : "Aktifkan status tercapai untuk mengisi tanggal."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto</FormLabel>
              <FormControl>
                <MultipleImageUploader
                  value={field.value ?? []}
                  onChange={field.onChange}
                  bucket="bucketlist"
                  folder="gallery"
                  maxImages={5}
                />
              </FormControl>
              <FormDescription>Maksimal 5 foto.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : "Tambah Impian"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
