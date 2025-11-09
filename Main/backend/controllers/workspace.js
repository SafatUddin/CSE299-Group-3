import Workspace from "../models/workspace.js";
import Project from "../models/project.js";

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [
        {
            user: req.user._id,
            role: "owner",
            joinedAt: new Date(),
        }
    ],
    });

    res.status(201).json( workspace );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspace = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
       _id: workspaceId,
        "members.user": req.user._id, 
      }).populate( "members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.status(200).json(workspace);
  } catch (error) {
  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      // members: { $in: [req.user._id] },
    })
      // .populate("tasks", "status")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      workspace,
      projects,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    let workspaceFilter;
    
    // If workspaceId is 'all' or not provided, get stats for all user's workspaces
    if (!workspaceId || workspaceId === 'all') {
      const userWorkspaces = await Workspace.find({
        "members.user": userId,
      });
      
      if (!userWorkspaces || userWorkspaces.length === 0) {
        return res.json({
          stats: {
            totalProjects: 0,
            totalTasks: 0,
            totalTaskCompleted: 0,
            totalTaskInProgress: 0,
            totalTaskToDo: 0,
            totalProjectInProgress: 0,
          },
          taskTrendsData: [],
          projectStatusData: [],
          taskPriorityData: [],
          workspaceProductivityData: [],
          upcomingTasks: [],
          recentProjects: [],
        });
      }
      
      workspaceFilter = { $in: userWorkspaces.map(ws => ws._id) };
    } else {
      // Get specific workspace stats
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          message: "Workspace not found",
        });
      }

      const isMember = workspace.members.some(
        (member) => member.user.toString() === userId.toString()
      );

      if (!isMember) {
        return res.status(403).json({
          message: "You are not a member of this workspace",
        });
      }
      
      workspaceFilter = workspaceId;
    }

    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceFilter }),
      Project.find({ workspace: workspaceFilter })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority"
        )
        .sort({ createdAt: -1 }),
    ]);

    const totalTasks = projects.reduce((acc, project) => {
      return acc + project.tasks.length;
    }, 0);

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;
    // const totalProjectCompleted = projects.filter(
    //   (project) => project.status === "Completed"
    // ).length;

    const totalTaskCompleted = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "Done").length
      );
    }, 0);

    const totalTaskToDo = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "To Do").length
      );
    }, 0);

    const totalTaskInProgress = projects.reduce((acc, project) => {
      return (
        acc +
        project.tasks.filter((task) => task.status === "In Progress").length
      );
    }, 0);

    const tasks = projects.flatMap((project) => project.tasks);

    // get upcoming task in next 7 days

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    // get last 7 days tasks date
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // populate

    for (const project of projects) {
      for (const task in project.tasks) {
        const taskDate = new Date(task.updatedAt);

        const dayInDate = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (dayInDate !== -1) {
          const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
            weekday: "short",
          });

          const dayData = taskTrendsData.find((day) => day.name === dayName);

          if (dayData) {
            switch (task.status) {
              case "Done":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.toDo++;
                break;
            }
          }
        }
      }
    }

    // get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );

      const completedTask = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getOverallStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all workspaces where user is a member
    const workspaces = await Workspace.find({
      "members.user": userId,
    });

    if (!workspaces || workspaces.length === 0) {
      return res.json({
        stats: {
          totalProjects: 0,
          totalTasks: 0,
          totalTaskCompleted: 0,
          totalTaskInProgress: 0,
          totalTaskToDo: 0,
        },
        taskTrendsData: [],
        projectStatusData: [],
        taskPriorityData: [],
        workspaceProductivityData: [],
        upcomingTasks: [],
        recentProjects: [],
      });
    }

    const workspaceIds = workspaces.map((ws) => ws._id);

    // Get all projects from all workspaces
    const projects = await Project.find({ workspace: { $in: workspaceIds } })
      .populate(
        "tasks",
        "title status dueDate project updatedAt isArchived priority"
      )
      .sort({ createdAt: -1 });

    const totalProjects = projects.length;

    const totalTasks = projects.reduce((acc, project) => {
      return acc + project.tasks.length;
    }, 0);

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;

    const totalTaskCompleted = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "Done").length
      );
    }, 0);

    const totalTaskToDo = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "To Do").length
      );
    }, 0);

    const totalTaskInProgress = projects.reduce((acc, project) => {
      return (
        acc +
        project.tasks.filter((task) => task.status === "In Progress").length
      );
    }, 0);

    const tasks = projects.flatMap((project) => project.tasks);

    // Get upcoming tasks in next 7 days
    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    // Task trends for last 7 days
    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    for (const project of projects) {
      for (const task of project.tasks) {
        const taskDate = new Date(task.updatedAt);
        const dayInDate = last7Days.findIndex(
          (date) =>
            date.toDateString() === taskDate.toDateString()
        );

        if (dayInDate !== -1) {
          if (task.status === "Done") {
            taskTrendsData[dayInDate].completed++;
          } else if (task.status === "In Progress") {
            taskTrendsData[dayInDate].inProgress++;
          } else if (task.status === "To Do") {
            taskTrendsData[dayInDate].toDo++;
          }
        }
      }
    }

    // Project status data
    const projectStatusData = [
      {
        name: "To Do",
        value: projects.filter((p) => p.status === "To Do").length,
      },
      {
        name: "In Progress",
        value: totalProjectInProgress,
      },
      {
        name: "Done",
        value: projects.filter((p) => p.status === "Done").length,
      },
    ];

    // Task priority data
    const taskPriorityData = [
      {
        name: "Low",
        value: tasks.filter((t) => t.priority === "Low").length,
      },
      {
        name: "Medium",
        value: tasks.filter((t) => t.priority === "Medium").length,
      },
      {
        name: "High",
        value: tasks.filter((t) => t.priority === "High").length,
      },
    ];

    // Workspace productivity data
    const workspaceProductivityData = workspaces.map((ws) => {
      const wsProjects = projects.filter(
        (p) => p.workspace.toString() === ws._id.toString()
      );
      const wsTasks = wsProjects.flatMap((p) => p.tasks);
      const completedTasks = wsTasks.filter((t) => t.status === "Done").length;

      return {
        name: ws.name,
        tasks: wsTasks.length,
        completed: completedTasks,
      };
    });

    const stats = {
      totalProjects,
      totalTasks,
      totalTaskCompleted,
      totalTaskInProgress,
      totalTaskToDo,
      totalProjectInProgress,
    };

    res.json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { 
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails, 
  getWorkspaceProjects, 
  getWorkspaceStats,
  getOverallStats
};