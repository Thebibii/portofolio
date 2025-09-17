"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AboutFormData } from "@/types/validation/about";
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
// import type { AboutFormData } from "@/lib/validations/about"

export function CurrentActivityForm({
  onRemove,
}: {
  onRemove: (values: any) => void;
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<AboutFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "currentActivities",
  });

  const addCurrentActivity = () => {
    append({
      title: "",
      content: "",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Current Activities</CardTitle>
        <Button type="button" onClick={addCurrentActivity} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Current Activity
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No current activities added yet. Click "Add Current Activity" to get
            started.
          </div>
        ) : (
          fields.map((field, index) => (
            <CurrentActivityItem
              key={field.id}
              index={index}
              onRemove={() => {
                if (field.dbId) {
                  onRemove(field.dbId);
                } else {
                  remove(index); // masih baru ditambahkan, belum ke server
                }
              }}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CurrentActivityItem({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<AboutFormData>();

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Current Activity #{index + 1}</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              // onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-mono">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onRemove}
                className={buttonVariants({ variant: "destructive" })}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`currentActivities.${index}.title`}>Title *</Label>
          <Input
            {...register(`currentActivities.${index}.title`)}
            placeholder="e.g. Learning Next.js 15"
          />
          {errors.currentActivities?.[index]?.title && (
            <p className="text-sm text-destructive">
              {errors.currentActivities[index]?.title?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`currentActivities.${index}.content`}>
            Content *
          </Label>
          <Textarea
            {...register(`currentActivities.${index}.content`)}
            placeholder="Describe what you're currently working on..."
            rows={4}
          />
          {errors.currentActivities?.[index]?.content && (
            <p className="text-sm text-destructive">
              {errors.currentActivities[index]?.content?.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
