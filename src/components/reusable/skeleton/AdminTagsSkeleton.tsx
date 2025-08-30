"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminTagsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-28 bg-muted rounded-md mb-2" />
          <div className="h-4 w-48 bg-muted rounded-md" />
        </div>
        <Button disabled className="opacity-50">
          <div className="h-4 w-16 bg-muted rounded-md" />
        </Button>
      </div>

      {/* Popular Tags Overview */}
      <Card className="bg-admin-card border-admin-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-muted rounded-full" />
            <div className="h-5 w-24 bg-muted rounded-md" />
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-40 bg-muted rounded-md mt-2" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-7 w-20 bg-muted rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card className="bg-admin-card border-admin-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-muted rounded-full" />
              <div>
                <div className="h-5 w-24 bg-muted rounded-md mb-2" />
                <div className="h-4 w-32 bg-muted rounded-md" />
              </div>
            </div>
            <div className="relative w-64">
              <Input disabled placeholder="Loading..." />
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
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-muted rounded-full" />
                      <div className="h-4 w-20 bg-muted rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-14 bg-muted rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted rounded-md" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="h-6 w-6 bg-muted rounded-md" />
                      <div className="h-6 w-6 bg-muted rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
