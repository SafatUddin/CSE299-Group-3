import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { EditProject } from "@/components/project/edit-project";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import { toast } from "sonner";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { Calendar, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

const ProjectDetails = () => {
  const { user } = useAuth();
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [isEditProject, setIsEditProject] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    })
  );

  const updateTaskStatusMutation = useUpdateTaskStatusMutation();

  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data: {
      tasks: Task[];
      project: Project;
    } | undefined;
    isLoading: boolean;
  };

  const { data: workspaceData } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: { members: Array<{ user: any }> } | undefined;
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  if (!data) {
    return <div>No project data found</div>;
  }

  const { project, tasks } = data;
  const projectProgress = getProjectProgress(tasks);

  const handleTaskClick = (taskId: string) => {
    // Find the task to check if user is assigned
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    // Check if user is assigned to the task
    const isAssigned = task.assignees?.some(
      (assignee) => assignee._id === user?._id
    );

    if (!isAssigned) {
      toast.error("You are not assigned to this task");
      return;
    }

    // Navigate to task details if assigned
    navigate(
      `/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag started:", event.active.id);
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Drag ended - Active:", active.id, "Over:", over?.id);
    setActiveTaskId(null);

    if (!over) {
      console.log("No drop target");
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    console.log("Moving task:", taskId, "to status:", newStatus);

    // Find the task being dragged
    const task = tasks.find((t) => t._id === taskId);
    if (!task) {
      console.log("Task not found");
      return;
    }
    
    if (task.status === newStatus) {
      console.log("Task already in this status");
      return;
    }

    console.log("Updating task status...");
    // Update the task status with optimistic update
    updateTaskStatusMutation.mutate(
      {
        taskId,
        status: newStatus,
      },
      {
        onSuccess: () => {
          console.log("Task status updated successfully");
        },
        onError: (error) => {
          console.error("Failed to update task status:", error);
        },
      }
    );
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  // Get active task for drag overlay
  const activeTask = tasks.find((t) => t._id === activeTaskId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500">{project.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-32">
            <div className="text-sm text-muted-foreground">Progress:</div>
            <div className="flex-1">
              <Progress value={projectProgress} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">
              {projectProgress}%
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsEditProject(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <Button onClick={() => setIsCreateTask(true)}>Add Task</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setTaskFilter("All")}>
                  All Tasks
                </TabsTrigger>
                <TabsTrigger value="todo" onClick={() => setTaskFilter("To Do")}>
                  To Do
                </TabsTrigger>
                <TabsTrigger
                  value="in-progress"
                  onClick={() => setTaskFilter("In Progress")}
                >
                  In Progress
                </TabsTrigger>
                <TabsTrigger value="done" onClick={() => setTaskFilter("Done")}>
                  Done
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center text-sm">
                <span className="text-muted-foreground">Status:</span>
                <div>
                  <Badge variant="outline" className="bg-background">
                    {tasks.filter((task) => task.status === "To Do").length} To Do
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    {tasks.filter((task) => task.status === "In Progress").length}{" "}
                    In Progress
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    {tasks.filter((task) => task.status === "Done").length} Done
                  </Badge>
                </div>
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <div className="grid grid-cols-3 gap-4">
                <DroppableColumn
                  id="To Do"
                  title="To Do"
                  tasks={tasks.filter((task) => task.status === "To Do")}
                  onTaskClick={handleTaskClick}
                />

                <DroppableColumn
                  id="In Progress"
                  title="In Progress"
                  tasks={tasks.filter((task) => task.status === "In Progress")}
                  onTaskClick={handleTaskClick}
                />

                <DroppableColumn
                  id="Done"
                  title="Done"
                  tasks={tasks.filter((task) => task.status === "Done")}
                  onTaskClick={handleTaskClick}
                />
              </div>
            </TabsContent>

            <TabsContent value="todo" className="m-0">
              <div className="grid md:grid-cols-1 gap-4">
                <DroppableColumn
                  id="To Do"
                  title="To Do"
                  tasks={tasks.filter((task) => task.status === "To Do")}
                  onTaskClick={handleTaskClick}
                  isFullWidth
                />
              </div>
            </TabsContent>

            <TabsContent value="in-progress" className="m-0">
              <div className="grid md:grid-cols-1 gap-4">
                <DroppableColumn
                  id="In Progress"
                  title="In Progress"
                  tasks={tasks.filter((task) => task.status === "In Progress")}
                  onTaskClick={handleTaskClick}
                  isFullWidth
                />
              </div>
            </TabsContent>

            <TabsContent value="done" className="m-0">
              <div className="grid md:grid-cols-1 gap-4">
                <DroppableColumn
                  id="Done"
                  title="Done"
                  tasks={tasks.filter((task) => task.status === "Done")}
                  onTaskClick={handleTaskClick}
                  isFullWidth
                />
              </div>
            </TabsContent>
          </Tabs>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-50 rotate-3">
                <TaskCard task={activeTask} onClick={() => {}} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* create    task dialog */}
      <CreateTaskDialog
        open={isCreateTask}
        onOpenChange={setIsCreateTask}
        projectId={projectId!}
        projectMembers={project.members as any}
      />

      {/* edit project dialog */}
      {workspaceData && (
        <EditProject
          open={isEditProject}
          onOpenChange={setIsEditProject}
          project={project}
          workspaceId={workspaceId!}
          workspaceMembers={
            workspaceData.members?.map((m) => m.user) || []
          }
        />
      )}
    </div>
  );
};

export default ProjectDetails;

interface DroppableColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  isFullWidth?: boolean;
}

const DroppableColumn = ({
  id,
  title,
  tasks,
  onTaskClick,
  isFullWidth = false,
}: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border-2 p-4 transition-all duration-200",
        isOver
          ? "border-primary bg-primary/20 ring-2 ring-primary ring-offset-2"
          : "border-border bg-muted/30 ",
        isFullWidth
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "min-h-[500px]"
      )}
    >
      <div
        className={cn(
          "space-y-4",
          !isFullWidth ? "h-full" : "col-span-full mb-4"
        )}
      >
        {!isFullWidth && (
          <div className="flex items-center justify-between">
            <h1 className="font-medium">{title}</h1>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
        )}

        <div
          className={cn(
            "space-y-3",
            isFullWidth && "grid grid-cols-2 lg:grid-cols-3 gap-4"
          )}
        >
          {tasks.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper for TaskCard to make it draggable
interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
}

const DraggableTaskCard = ({ task, onClick }: DraggableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: task._id,
    data: {
      task,
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleClick = () => {
    // Only trigger onClick if not dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="touch-none"
    >
      <TaskCard task={task} onClick={handleClick} isDragging={isDragging} />
    </div>
  );
};

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  isFullWidth?: boolean;
}

const TaskColumn = ({
  title,
  tasks,
  onTaskClick,
  isFullWidth = false,
}: TaskColumnProps) => {
  return (
    <div
      className={
        isFullWidth
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : ""
      }
    >
      <div
        className={cn(
          "space-y-4",
          !isFullWidth ? "h-full" : "col-span-full mb-4"
        )}
      >
        {!isFullWidth && (
          <div className="flex items-center justify-between">
            <h1 className="font-medium">{title}</h1>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
        )}

        <div
          className={cn(
            "space-y-3",
            isFullWidth && "grid grid-cols-2 lg:grid-cols-3 gap-4"
          )}
        >
          {tasks.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  onClick,
  isDragging = false,
}: {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",
        isDragging && "opacity-50 cursor-grabbing"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge
            className={
              task.priority === "High"
                ? "bg-red-500 text-white"
                : task.priority === "Medium"
                ? "bg-orange-500 text-white"
                : "bg-slate-500 text-white"
            }
          >
            {task.priority}
          </Badge>

          <Badge variant="secondary" className="text-xs">
            {task.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <h4 className="font-medium mb-2">{task.title}</h4>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 5).map((member) => (
                  <Avatar
                    key={member._id}
                    className="relative size-8 bg-gray-700 rounded-full border-2 border-background overflow-hidden"
                    title={member.name}
                  >
                    {member.profilePicture && (
                      <AvatarImage 
                        src={`${import.meta.env.VITE_API_URL.replace('/api-v1', '')}${member.profilePicture}`}
                        alt={member.name}
                      />
                    )}
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}

                {task.assignees.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    + {task.assignees.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="size-3 mr-1" />
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </div>
          )}
        </div>
        {/* 5/10 subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {task.subtasks.filter((subtask) => subtask.completed).length} /{" "}
            {task.subtasks.length} subtasks
          </div>
        )}
      </CardContent>
    </Card>
  );
};