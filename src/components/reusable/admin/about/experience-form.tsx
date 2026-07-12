"use client";

import { useState, useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AboutFormData } from "@/types/validation/about";
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

export function ExperienceForm({
  onRemove,
}: {
  onRemove: (values: any) => void;
}) {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<AboutFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  const addExperience = () => {
    append({
      dbId: undefined,
      position: "",
      company: "",
      location: "",
      startDate: new Date(),
      endDate: null,
      duration: "",
      description: "",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Experience</CardTitle>
        <Button type="button" onClick={addExperience} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No experiences added yet. Click "Add Experience" to get started.
          </div>
        ) : (
          fields.map((field, index) => (
            <ExperienceItem
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

function ExperienceItem({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<AboutFormData>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const startDate = watch(`experiences.${index}.startDate`);
  const endDate = watch(`experiences.${index}.endDate`);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      const parts: string[] = [];
      if (years > 0) parts.push(`${years} yr`);
      if (months > 0) parts.push(`${months} mon`);
      setValue(`experiences.${index}.duration`, parts.join(" ") || "0 mon");
    } else if (!endDate) {
      setValue(`experiences.${index}.duration`, "");
    }
  }, [startDate, endDate, index, setValue]);

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Experience #{index + 1}</CardTitle>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="hidden" {...register(`experiences.${index}.dbId`)} />

          <div className="space-y-2">
            <Label htmlFor={`experiences.${index}.position`}>Position *</Label>
            <Input
              {...register(`experiences.${index}.position`)}
              placeholder="e.g. Senior Developer"
            />
            {errors.experiences?.[index]?.position && (
              <p className="text-sm text-destructive">
                {errors.experiences[index]?.position?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`experiences.${index}.company`}>Company *</Label>
            <Input
              {...register(`experiences.${index}.company`)}
              placeholder="e.g. Tech Corp"
            />
            {errors.experiences?.[index]?.company && (
              <p className="text-sm text-destructive">
                {errors.experiences[index]?.company?.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`experiences.${index}.location`}>Location</Label>
          <Input
            {...register(`experiences.${index}.location`)}
            placeholder="e.g. Jakarta, Indonesia"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setValue(
                      `experiences.${index}.startDate`,
                      date || new Date()
                    );
                    setStartDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.experiences?.[index]?.startDate && (
              <p className="text-sm text-destructive">
                {errors.experiences[index]?.startDate?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <div className="flex gap-2">
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Present / Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate ?? undefined}
                    onSelect={(date) => {
                      setValue(`experiences.${index}.endDate`, date ?? undefined);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {endDate && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setValue(`experiences.${index}.endDate`, null)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`experiences.${index}.duration`}>Duration</Label>
          <Input
            {...register(`experiences.${index}.duration`)}
            placeholder="e.g. 2 years 3 months"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`experiences.${index}.description`}>
            Description
          </Label>
          <Textarea
            {...register(`experiences.${index}.description`)}
            placeholder="Describe your role and achievements..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
