"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import LoadingState from "@/components/reusable/state/loading-state";
import FormSkeleton from "@/components/reusable/skeleton/form-skeleton";
import ProfileForm from "@/components/reusable/admin/about/profile-form";
import { useAdminAboutProfile } from "@/hooks/react-query/admin/about/use-profile";

export default function Page() {
  const { data, isLoading } = useAdminAboutProfile();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/about">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-foreground">Hero Profile</h2>
            <p className="text-muted-foreground">
              Manage the intro shown at the top of /about
            </p>
          </div>
        </div>
      </div>

      <LoadingState
        data={!isLoading}
        loadingFallback={<FormSkeleton contentClassName="h-64" />}
      >
        <ProfileForm profile={data?.data ?? null} />
      </LoadingState>
    </div>
  );
}
