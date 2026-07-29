"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProjectFormData, ProjectStatus } from "@/types/projects";
import { useCreateProject } from "@/hooks/react-query/admin/projects/use-mutation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import LoadingState from "../../state/loading-state";
import ProjectFormSkeleton from "../../skeleton/project-form-skeleton";
import {
  SingleImageUploader,
  MultipleImageUploader,
} from "@/components/ui/image-uploader";
import { PlateEditor } from "@/components/plate-editor";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).default([]),
  technologies: z
    .array(z.string())
    .min(1, "At least one technology is required"),
  demoUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  featured: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

interface ProjectFormProps {
  initialData?: ProjectFormData;
  isEditing?: boolean;
}

export default function FormCreateProject({
  initialData,
  isEditing = false,
}: ProjectFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const [newTechnology, setNewTechnology] = useState("");

  const { mutate, isPending } = useCreateProject({
    onSuccess: (body) => {
      queryClient.invalidateQueries({ queryKey: ["get.admin.projects"] });
      toast.success("Success", {
        description: body.message,
      });
      router.back();
    },
    onError: (error: any) => {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui";

      toast.error("Error", {
        description: message,
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      longDescription: "",
      image: "",
      images: [],
      technologies: [],
      demoUrl: "",
      sourceUrl: "",
      status: ProjectStatus.PLANNING,
      featured: false,
      startDate: undefined,
      endDate: undefined,
    },
  });

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      mutate({
        longDescription: JSON.stringify(data.longDescription),
        ...data,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const addTechnology = () => {
    if (newTechnology.trim()) {
      const currentTechnologies = form.getValues("technologies");
      if (!currentTechnologies.includes(newTechnology.trim())) {
        form.setValue("technologies", [
          ...currentTechnologies,
          newTechnology.trim(),
        ]);
      }
      setNewTechnology("");
    }
  };

  const removeTechnology = (tech: string) => {
    const currentTechnologies = form.getValues("technologies");
    form.setValue(
      "technologies",
      currentTechnologies.filter((t) => t !== tech)
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <ProjectFormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
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
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the project"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <PlateEditor
                      {...field}
                      placeholder="Type your project content..."
                      className="h-[300px] overflow-y-auto"
                      uploadBucket="projects"
                      uploadFolder="description"
                    />
                  </FormControl>
                  <FormDescription>
                    Write your post content using the rich text editor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="font-mono">
                        <SelectItem value={ProjectStatus.PLANNING}>
                          Planning
                        </SelectItem>
                        <SelectItem value={ProjectStatus.IN_PROGRESS}>
                          In Progress
                        </SelectItem>
                        <SelectItem value={ProjectStatus.COMPLETED}>
                          Completed
                        </SelectItem>
                        <SelectItem value={ProjectStatus.ON_HOLD}>
                          On Hold
                        </SelectItem>
                        <SelectItem value={ProjectStatus.ARCHIVED}>
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Featured Project
                      </FormLabel>
                      <FormDescription>
                        Highlight this project on your portfolio
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images Section - Updated with Supabase Upload */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Project Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Image */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Project Image</FormLabel>
                  <FormControl>
                    <SingleImageUploader
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange("")}
                      bucket="projects"
                      folder="main"
                      placeholder="Upload main project image"
                    />
                  </FormControl>
                  <FormDescription>
                    This will be the primary image displayed for your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Images Gallery */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Gallery</FormLabel>
                  <FormControl>
                    <MultipleImageUploader
                      value={field.value || []}
                      onChange={field.onChange}
                      bucket="projects"
                      folder="gallery"
                      maxImages={8}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional images to showcase your project (max 8 images)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technologies */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Technologies Used</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="technologies"
              render={() => (
                <FormItem>
                  <FormLabel>Technologies</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add technology (e.g., React, Node.js)"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addTechnology())
                      }
                    />
                    <Button
                      type="button"
                      onClick={addTechnology}
                      disabled={!newTechnology.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.watch("technologies").map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="flex items-center gap-1 cursor-default hover:bg-destructive/10"
                      >
                        {tech}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeTechnology(tech)}
                        />
                      </Badge>
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Project Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="demoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://demo.example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Live demo or deployed version
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Code URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/user/repo"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Repository or source code link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : isEditing
              ? "Update Project"
              : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
