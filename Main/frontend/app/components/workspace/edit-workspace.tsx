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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { workspaceSchema } from "@/lib/schema";
import type { z } from "zod";
import {
  useUpdateWorkspace,
  useDeleteWorkspace,
  useTransferOwnership,
} from "@/hooks/use-workspace";
import { toast } from "sonner";
import type { Workspace, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Trash2, Crown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/provider/auth-context";

export type WorkspaceFormData = z.infer<typeof workspaceSchema>;

const PREDEFINED_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
];

interface EditWorkspaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}

export const EditWorkspace = ({
  open,
  onOpenChange,
  workspace,
}: EditWorkspaceProps) => {
  const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace();
  const { mutateAsync: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspace();
  const { mutateAsync: transferOwnership, isPending: isTransferring } =
    useTransferOwnership();
  const [members, setMembers] = useState(workspace.members || []);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwner =
    workspace.members?.some(
      (m) =>
        m.role === "owner" &&
        (typeof m.user === "string" ? m.user : m.user._id) === user?._id
    ) || false;

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
      color: workspace.color,
    },
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    try {
      const workspaceData = {
        ...data,
        members: members.map((member) => ({
          user: typeof member.user === "string" ? member.user : member.user._id,
          role: member.role,
          joinedAt: member.joinedAt,
        })),
      };

      await updateWorkspace({
        workspaceId: workspace._id,
        workspaceData,
      });

      toast.success("Workspace updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update workspace");
      console.error(error);
    }
  };

  const removeMember = (userId: string) => {
    // Don't allow removing the owner
    const member = members.find(
      (m) => (typeof m.user === "string" ? m.user : m.user._id) === userId
    );

    if (member?.role === "owner") {
      toast.error("Cannot remove workspace owner");
      return;
    }

    setMembers((prev) =>
      prev.filter(
        (m) => (typeof m.user === "string" ? m.user : m.user._id) !== userId
      )
    );
  };

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspace(workspace._id);
      toast.success("Workspace deleted successfully");
      setShowDeleteDialog(false);
      onOpenChange(false);
      navigate("/workspace");
    } catch (error) {
      toast.error("Failed to delete workspace");
      console.error(error);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      toast.error("Please select a new owner");
      return;
    }

    try {
      await transferOwnership({
        workspaceId: workspace._id,
        newOwnerId: selectedNewOwner,
      });
      toast.success("Ownership transferred successfully");
      setShowTransferDialog(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to transfer ownership");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>
            Update workspace details and manage members.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Workspace name" {...field} />
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
                      placeholder="Workspace description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Members</FormLabel>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {members.map((member) => {
                  const user = typeof member.user === "string" ? null : member.user;
                  if (!user) return null;

                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email} • {member.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwner && member.role !== "owner" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedNewOwner(user._id);
                              setShowTransferDialog(true);
                            }}
                            title="Transfer ownership"
                          >
                            <Crown className="h-4 w-4" />
                          </Button>
                        )}
                        {member.role !== "owner" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(user._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isOwner && (
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Workspace
                </Button>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workspace? This action cannot
              be undone. All projects and tasks in this workspace will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Ownership Dialog */}
      <AlertDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Ownership</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer ownership to this member? You
              will become an admin and they will become the owner of the
              workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferOwnership}
              disabled={isTransferring}
            >
              {isTransferring ? "Transferring..." : "Transfer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
