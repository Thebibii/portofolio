"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Upload, X } from "lucide-react";
import { Category, Post, PostStatus, PostType, Tag } from "@/types/blogs";
import EmptyState from "../../state/empty-state";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SingleImageUploader } from "@/components/ui/image-uploader";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.nativeEnum(PostStatus),
  featured: z.boolean(),
  readingTime: z.number().min(1, "Reading time must be at least 1 minute"),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

type FormCreatePostData = z.infer<typeof postSchema>;

interface FormCreatePostProps {
  post?: Post;
  categories: Category[];
  tags: Tag[];
  onSubmit: (data: FormCreatePostData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function FormCreatePost({
  post,
  categories,
  tags,
  onSubmit,
  onCancel,
  isLoading = false,
}: FormCreatePostProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map(({ tag }: any) => tag.id) || []
  );

  const form = useForm<FormCreatePostData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      coverImage: post?.coverImage || "",
      status: post?.status || PostStatus.DRAFT,
      featured: post?.featured || false,
      readingTime: post?.readingTime || 1,
      categoryId: post?.categoryId || "none",
      tagIds: selectedTags,
    },
  });

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (watchTitle && !post) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    }
  }, [watchTitle, form, post]);

  // Auto-calculate reading time from content
  const watchContent = form.watch("content");
  useEffect(() => {
    if (watchContent) {
      const wordsPerMinute = 200;
      const wordCount = watchContent.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
      form.setValue("readingTime", readingTime);
    }
  }, [watchContent, form]);

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);
    form.setValue("tagIds", newSelectedTags);
  };

  const handleFormSubmit = (data: FormCreatePostData) => {
    // Convert "none" back to undefined for categoryId
    const processedData = {
      ...data,
      categoryId: data.categoryId === "none" ? undefined : data.categoryId,
      tagIds: selectedTags,
    };
    onSubmit(processedData);
  };

  const handleSaveDraft = () => {
    form.setValue("status", PostStatus.DRAFT);
    form.handleSubmit(handleFormSubmit)();
  };

  const handlePublish = () => {
    form.setValue("status", PostStatus.PUBLISHED);
    form.handleSubmit(handleFormSubmit)();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="post-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the post..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          control={form.control}
                          name="content"
                          placeholder="Write your post content here..."
                        />
                      </FormControl>
                      <FormDescription>
                        Write your post content using the rich text editor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveDraft}
                    variant="outline"
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                  <Button
                    type="button"
                    onClick={onCancel}
                    variant="ghost"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Post Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={
                          field.value === "" ? "none" : field.value || "none"
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="font-mono">
                          <SelectItem value="none">No Category</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
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
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Post</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mark as featured post
                        </div>
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

                <FormField
                  control={form.control}
                  name="readingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reading Time (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  data={tags}
                  emptyFallback={
                    <p className="text-sm text-muted-foreground text-center">
                      Data is Empty
                    </p>
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {tags?.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={
                          selectedTags.includes(tag.id) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        style={{
                          backgroundColor: selectedTags.includes(tag.id)
                            ? tag.color || undefined
                            : undefined,
                          borderColor: tag.color || undefined,
                          color: selectedTags.includes(tag.id)
                            ? "white"
                            : tag.color || undefined,
                        }}
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name}
                        {selectedTags.includes(tag.id) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </EmptyState>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Gallery</FormLabel>
                      <FormControl>
                        <SingleImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          onRemove={() => field.onChange("")}
                          bucket="posts"
                          folder="main"
                          placeholder="Upload main project image"
                        />
                      </FormControl>
                      <FormDescription>
                        Additional images to showcase your project (max 8
                        images)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
