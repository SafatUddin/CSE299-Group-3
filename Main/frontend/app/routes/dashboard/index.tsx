import { RecentProjects } from "@/components/dashboard/recent-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetOverallStatsQuery } from "@/hooks/use-workspace";
import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";

const Dashboard = () => {
  const { data, isPending } = useGetOverallStatsQuery() as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
  };

  if (isPending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
        <p className="text-muted-foreground">Unable to load dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 2xl:space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <StatsCard data={data.stats} />

      <StatisticsCharts
        stats={data.stats}
        taskTrendsData={data.taskTrendsData}
        projectStatusData={data.projectStatusData}
        taskPriorityData={data.taskPriorityData}
        workspaceProductivityData={data.workspaceProductivityData}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={data.recentProjects} />
        <UpcomingTasks data={data.upcomingTasks} />
      </div>
    </div>
  );
};

export default Dashboard;