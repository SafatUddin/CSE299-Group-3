import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import User from "../models/user.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";
import { recordActivity } from "../libs/index.js";

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
    const startTime = Date.now();
    const workspace = await Workspace.find({
      "members.user": req.user._id,
    })
    .select("name description color members")
    .limit(50)
    .sort({ createdAt: -1 })
    .lean();

    console.log(`[PERF] getWorkspaces: ${Date.now() - startTime}ms`);
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

    const workspace = await Workspace.findById(workspaceId)
      .select("name description color owner members")
      .populate("members.user", "name email")
      .lean();

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, color, members } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Check if user is owner or admin
    const userMember = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMember || (userMember.role !== "owner" && userMember.role !== "admin")) {
      return res.status(403).json({
        message: "You don't have permission to update this workspace",
      });
    }

    // Update workspace fields
    workspace.name = name || workspace.name;
    workspace.description = description !== undefined ? description : workspace.description;
    workspace.color = color || workspace.color;
    
    // Update members if provided (only if user is owner)
    if (members && userMember.role === "owner") {
      workspace.members = members;
    }

    await workspace.save();

    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate("members.user", "name email profilePicture");

    res.status(200).json(updatedWorkspace);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Check if user is the owner
    const userMember = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMember || userMember.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can delete the workspace",
      });
    }

    // Delete all projects and tasks in the workspace
    await Project.deleteMany({ workspace: workspaceId });

    // Delete workspace invites
    await WorkspaceInvite.deleteMany({ workspaceId });

    // Delete the workspace
    await Workspace.deleteOne({ _id: workspaceId });

    res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const transferOwnership = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { newOwnerId } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Check if user is the owner
    const currentOwner = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!currentOwner || currentOwner.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can transfer ownership",
      });
    }

    // Check if new owner is a member
    const newOwnerMember = workspace.members.find(
      (member) => member.user.toString() === newOwnerId
    );

    if (!newOwnerMember) {
      return res.status(400).json({
        message: "New owner must be a member of the workspace",
      });
    }

    // Update roles
    workspace.members = workspace.members.map((member) => {
      if (member.user.toString() === req.user._id.toString()) {
        return { ...member, role: "admin" };
      }
      if (member.user.toString() === newOwnerId) {
        return { ...member, role: "owner" };
      }
      return member;
    });

    workspace.owner = newOwnerId;
    await workspace.save();

    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate("members.user", "name email profilePicture");

    res.status(200).json(updatedWorkspace);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    })
    .populate("members.user", "name email")
    .lean();

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      "members.user": req.user._id,
    })
      .select("title description status startDate dueDate progress tags createdBy createdAt updatedAt")
      .populate("tasks", "status")
      .sort({ createdAt: -1 })
      .lean();
    
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

const getOverallStats = async (req, res) => {
  try {
    const startTime = Date.now();
    const userId = req.user._id;

    // Get all workspace where user is a member - only fetch _id
    const workspace = await Workspace.find(
      { "members.user": userId },
      { _id: 1, name: 1 }
    );
    console.log(`[PERF] Workspace query: ${Date.now() - startTime}ms`);

    if (!workspace || workspace.length === 0) {
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

    const workspaceIds = workspace.map((ws) => ws._id);

    // Get all projects from all workspace - limit to recent 20 for performance
    const projectStart = Date.now();
    const projects = await Project.find({ 
      workspace: { $in: workspaceIds },
      "members.user": userId 
    })
      .select("title status workspace createdAt")
      .limit(15)
      .sort({ createdAt: -1 })
      .lean();
    console.log(`[PERF] Projects query: ${Date.now() - projectStart}ms`);

    const totalProjects = projects.length;
    
    // Get project IDs for task queries
    const projectIds = projects.map(p => p._id);

    // Run task queries in parallel
    const taskStart = Date.now();
    const [tasks, upcomingTasks] = await Promise.all([
      // Fetch tasks for the projects we retrieved
      Task.find({
        project: { $in: projectIds },
        isArchived: false
      })
        .select("status dueDate project updatedAt priority")
        .limit(150)
        .lean(),
      
      // Get upcoming tasks for next 7 days
      Task.find({
        project: { $in: projectIds },
        isArchived: false,
        dueDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
        .lean()
    ]);
    console.log(`[PERF] Tasks query: ${Date.now() - taskStart}ms`);

    const totalTasks = tasks.length;

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;

    const totalTaskCompleted = tasks.filter((task) => task.status === "Done").length;

    const totalTaskToDo = tasks.filter((task) => task.status === "To Do").length;

    const totalTaskInProgress = tasks.filter((task) => task.status === "In Progress").length;

    // Simplified task trends - just use current counts instead of historical data
    const taskTrendsData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return {
        name: dayNames[date.getDay()],
        completed: i === 6 ? totalTaskCompleted : 0,
        inProgress: i === 6 ? totalTaskInProgress : 0,
        toDo: i === 6 ? totalTaskToDo : 0,
      };
    });

    // Project status data
    const projectStatusData = [
      {
        name: "Planning",
        value: projects.filter((p) => p.status === "Planning").length,
        color: "#f59e0b",
      },
      {
        name: "In Progress",
        value: projects.filter((p) => p.status === "In Progress").length,
        color: "#3b82f6",
      },
      {
        name: "On Hold",
        value: projects.filter((p) => p.status === "On Hold").length,
        color: "#f97316",
      },
      {
        name: "Completed",
        value: projects.filter((p) => p.status === "Completed").length,
        color: "#10b981",
      },
      {
        name: "Cancelled",
        value: projects.filter((p) => p.status === "Cancelled").length,
        color: "#ef4444",
      },
    ];

    // Task priority data
    const taskPriorityData = [
      {
        name: "Low",
        value: tasks.filter((t) => t.priority === "Low").length,
        color: "#6b7280",
      },
      {
        name: "Medium",
        value: tasks.filter((t) => t.priority === "Medium").length,
        color: "#f59e0b",
      },
      {
        name: "High",
        value: tasks.filter((t) => t.priority === "High").length,
        color: "#ef4444",
      },
    ];

    // Workspace productivity data
    const workspaceProductivityData = workspace.map((ws) => {
      const wsProjects = projects.filter(
        (p) => p.workspace.toString() === ws._id.toString()
      );
      const wsProjectIds = wsProjects.map(p => p._id.toString());
      const wsTasks = tasks.filter(t => wsProjectIds.includes(t.project.toString()));
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

    // Add task data to recent projects for frontend
    const recentProjectsWithTasks = projects.slice(0, 5).map(project => {
      const projectTasks = tasks.filter(t => t.project.toString() === project._id.toString());
      return {
        ...project,
        tasks: projectTasks
      };
    });

    res.json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks: upcomingTasks.slice(0, 5),
      recentProjects: recentProjectsWithTasks,
    });
    console.log(`[PERF] Total getOverallStats: ${Date.now() - startTime}ms`);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You are not authorized to invite members to this workspace",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const isInvited = await WorkspaceInvite.findOne({
      user: existingUser._id,
      workspaceId: workspaceId,
    });

    if (isInvited && isInvited.expiresAt > new Date()) {
      return res.status(400).json({
        message: "User already invited to this workspace",
      });
    }

    if (isInvited && isInvited.expiresAt < new Date()) {
      await WorkspaceInvite.deleteOne({ _id: isInvited._id });
    }

    const inviteToken = jwt.sign(
      {
        user: existingUser._id,
        workspaceId: workspaceId,
        role: role || "member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await WorkspaceInvite.create({
      user: existingUser._id,
      workspaceId: workspaceId,
      token: inviteToken,
      role: role || "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

    const emailContent = `
      <p>You have been invited to join ${workspace.name} workspace</p>
      <p>Click here to join: <a href="${invitationLink}">${invitationLink}</a></p>
    `;

    await sendEmail(
      email,
      "You have been invited to join a workspace",
      emailContent
    );

    res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptGenerateInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Joined ${workspace.name} workspace`,
      }
    );

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const inviteInfo = await WorkspaceInvite.findOne({
      user: user,
      workspaceId: workspaceId,
    });

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired",
      });
    }

    workspace.members.push({
      user: user,
      role: role || "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(user, "joined_workspace", "Workspace", workspaceId, {
        description: `Joined ${workspace.name} workspace`,
      }),
    ]);

    res.status(200).json({
      message: "Invitation accepted successfully",
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
  updateWorkspace,
  deleteWorkspace,
  transferOwnership,
  getWorkspaceProjects, 
  getOverallStats,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken
};