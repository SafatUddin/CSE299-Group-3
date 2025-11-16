import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UseUpdateProject } from "@/hooks/use-project";
import { toast } from "sonner";
import type { Project, User } from "@/types";
import { ProjectStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { projectSchema } from "@/lib/schema";

export type EditProjectFormData = z.infer<typeof projectSchema>;

interface EditProjectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  workspaceId: string;
  workspaceMembers: User[];
}

export const EditProject = ({
  open,
  onOpenChange,
  project,
  workspaceId,
  workspaceMembers,
}: EditProjectProps) => {
  const { mutateAsync: updateProject, isPending } = UseUpdateProject();
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    project.members?.map((m) => (typeof m.user === "string" ? m.user : m.user._id)) || []
  );

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title,
      description: project.description || "",
      status: project.status,
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      dueDate: project.dueDate
        ? new Date(project.dueDate).toISOString().split("T")[0]
        : "",
      tags: "",
    },
  });

  const onSubmit = async (data: EditProjectFormData) => {
    try {
      const projectData = {
        ...data,
        members: selectedMembers.map((userId) => ({
          user: userId,
          role: "contributor" as const,
        })),
      };

      await updateProject({
        projectId: project._id,
        projectData,
        workspaceId,
      });

      toast.success("Project updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update project");
      console.error(error);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Project title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Project description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ProjectStatus.PLANNING}>
                        {ProjectStatus.PLANNING}
                      </SelectItem>
                      <SelectItem value={ProjectStatus.IN_PROGRESS}>
                        {ProjectStatus.IN_PROGRESS}
                      </SelectItem>
                      <SelectItem value={ProjectStatus.ON_HOLD}>
                        {ProjectStatus.ON_HOLD}
                      </SelectItem>
                      <SelectItem value={ProjectStatus.COMPLETED}>
                        {ProjectStatus.COMPLETED}
                      </SelectItem>
                      <SelectItem value={ProjectStatus.CANCELLED}>
                        {ProjectStatus.CANCELLED}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tag1, Tag2, Tag3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Project Members</FormLabel>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {workspaceMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profilePicture} />
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedMembers.includes(member._id)}
                      onCheckedChange={() => toggleMember(member._id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
