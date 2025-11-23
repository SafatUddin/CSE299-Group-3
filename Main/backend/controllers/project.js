import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import { createNotification } from "./notification.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
        (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
        return res.status(403).json({
            message: "You are not a member of this workspace",
        });
    }

    const tagArray = tags ? tags.split(",") : [];

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members,
      createdBy: req.user._id,
    });

    workspace.projects.push(newProject._id);
    await workspace.save();

    // Create notifications for project members
    if (members && members.length > 0) {
      const notificationPromises = members
        .filter((member) => member.user.toString() !== req.user._id.toString())
        .map((member) =>
          createNotification({
            user: member.user,
            type: "added_to_project",
            message: `added you to project "${title}"`,
            resourceType: "Project",
            resourceId: newProject._id,
            workspace: workspaceId,
            actionBy: req.user._id,
          })
        );
      
      await Promise.all(notificationPromises);
    }

    return res.status(201).json(newProject);

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .select("title description status startDate dueDate progress tags members createdBy createdAt updatedAt")
      .populate("members.user", "name email profilePicture")
      .lean();

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .select("title description status priority assignees dueDate createdAt updatedAt")
      .populate("assignees", "name email profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tagArray = tags ? tags.split(",") : project.tags;

    project.title = title || project.title;
    project.description = description !== undefined ? description : project.description;
    project.status = status || project.status;
    project.startDate = startDate || project.startDate;
    project.dueDate = dueDate || project.dueDate;
    project.tags = tagArray;
    project.members = members || project.members;

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { createProject, getProjectDetails, getProjectTasks, updateProject };