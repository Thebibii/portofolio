"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAbout } from "@/hooks/react-query/admin/about/use-query";
import { CurrentActivity, Experience } from "@prisma/client";
import { Activity, Briefcase, Plus } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { data } = useAdminAbout();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">About</h2>
          <p className="text-muted-foreground mt-1">
            Manage your content about
          </p>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="transition-all duration-300 hover:shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Experiences
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data?.data?.experiences?.length}
            </div>
            <p className="text-xs text-muted-foreground">Professional roles</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Activities
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data?.data?.currentActivities?.length}
            </div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience Management
            </CardTitle>
            <CardDescription>
              Manage your professional experiences and career history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/admin/about/experiences">
                <Plus className="h-4 w-4 mr-2" />
                Manage Experiences
              </Link>
            </Button>
            {/* Recent Experiences */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Recent Experiences
              </h4>
              {data?.data?.experiences.map((exp: Experience) => (
                <div
                  key={exp.id}
                  className="text-sm p-2 rounded-md bg-muted/30"
                >
                  <div className="font-medium">{exp.position}</div>
                  <div className="text-muted-foreground">{exp.company}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activities Management
            </CardTitle>
            <CardDescription>
              Manage your current activities and ongoing projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 ">
            <Button asChild className="w-full">
              <Link href="/admin/about/current-activities">
                <Plus className="h-4 w-4 mr-2" />
                Manage Current Activities
              </Link>
            </Button>
            {/* Recent Activities */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Recent Activities
              </h4>
              {data?.data?.currentActivities?.map(
                (activity: CurrentActivity) => (
                  <div
                    key={activity.id}
                    className="text-sm p-2 rounded-md bg-muted/30"
                  >
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-muted-foreground line-clamp-1">
                      {activity.content}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
