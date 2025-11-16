import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format } from "date-fns";
import { Archive, ArchiveRestore, Clock } from "lucide-react";
import { Link } from "react-router";

const Archived = () => {
  const { data: allTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  const archivedTasks = allTasks?.filter((task) => task.isArchived) || [];

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Archived Items</h1>
          <p className="text-muted-foreground">View and restore archived tasks</p>
        </div>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">
            <Archive className="w-4 h-4 mr-2" />
            Archived Tasks ({archivedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Archived Tasks</CardTitle>
              <CardDescription>
                Tasks that have been archived
              </CardDescription>
            </CardHeader>

            <CardContent>
              {archivedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Archive className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Archived Tasks</h3>
                  <p className="text-muted-foreground">
                    You haven't archived any tasks yet
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {archivedTasks.map((task) => (
                    <div key={task._id} className="p-4 hover:bg-muted/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <Link
                            to={`/workspace/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors"
                          >
                            {task.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Archived: {format(task.updatedAt, "PPP")}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{task.status}</Badge>
                            <Badge
                              variant={
                                task.priority === "High"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="font-medium">
                            Project: {task.project.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Archived;
