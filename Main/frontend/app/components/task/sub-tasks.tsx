import type { Subtask } from "@/types";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import {
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";

export const SubTasksDetails = ({
  subTasks,
  taskId,
}: {
  subTasks: Subtask[];
  taskId: string;
}) => {
  const [newSubTask, setNewSubTask] = useState("");
  const { mutate: addSubTask, isPending } = useAddSubTaskMutation();
  const { mutate: updateSubTask, isPending: isUpdating } =
    useUpdateSubTaskMutation();

  const handleToggleTask = (subTaskId: string, checked: boolean) => {
    updateSubTask(
      { taskId, subTaskId, completed: checked },
      {
        onError: (error: any) => {
          const errMessage = error.response.data.message;
          console.log(error);
          toast.error(errMessage);
        },
      }
    );
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    
    addSubTask(
      { taskId, title: newSubTask },
      {
        onSuccess: () => {
          setNewSubTask("");
        },
        onError: (error: any) => {
          const errMessage = error.response.data.message;
          console.log(error);
          toast.error(errMessage);
        },
      }
    );
  };

  const completedCount = subTasks.filter(st => st.completed).length;
  const totalCount = subTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Sub Tasks</CardTitle>
          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {subTasks.length > 0 ? (
          <div className="space-y-2">
            {subTasks.map((subTask) => (
              <div
                key={subTask._id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                  subTask.completed
                    ? "bg-muted/50 border-muted"
                    : "bg-background border-border hover:border-primary/50 hover:shadow-sm"
                )}
              >
                <Checkbox
                  id={subTask._id}
                  checked={subTask.completed}
                  onCheckedChange={(checked) =>
                    handleToggleTask(subTask._id, !!checked)
                  }
                  disabled={isUpdating}
                  className="mt-0.5"
                />

                <label
                  htmlFor={subTask._id}
                  className={cn(
                    "flex-1 text-sm cursor-pointer transition-all",
                    subTask.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground group-hover:text-primary"
                  )}
                >
                  {subTask.title}
                </label>

                {subTask.completed ? (
                  <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/40 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <CheckCircle2 className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No sub tasks yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Add your first sub task below</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Add a new sub task..."
            value={newSubTask}
            onChange={(e) => setNewSubTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newSubTask.trim()) {
                handleAddSubTask();
              }
            }}
            disabled={isPending}
            className="flex-1"
          />

          <Button
            onClick={handleAddSubTask}
            disabled={isPending || !newSubTask.trim()}
            size="default"
            className="px-4"
          >
            <Plus className="size-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};