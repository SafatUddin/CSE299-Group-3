import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignees } =
      req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = await Workspace.findById(project.workspace);

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

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignees,
      project: projectId,
      createdBy: req.user._id,
    });

    project.tasks.push(newTask._id);
    await project.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
    .populate("assignees", "name email")
    .populate("watchers", "name email")
    .lean();

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project)
      .select("title members")
      .populate("members.user", "name email")
      .lean();

    // Check if user is assigned to the task
    const isAssignee = task.assignees.some(
      (assignee) => assignee._id.toString() === req.user._id.toString()
    );

    // User must be assigned to the task to view its details
    if (!isAssignee) {
      return res.status(403).json({
        message: "You must be assigned to this task to view its details",
      });
    }

    res.status(200).json({ task , project });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskTitle = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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

    const oldTitle = task.title;

    task.title = title;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task title from ${oldTitle} to ${title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskDescription = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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

    const oldDescription =
      task.description.substring(0, 50) +
      (task.description.length > 50 ? "..." : "");
    const newDescription =
      description.substring(0, 50) + (description.length > 50 ? "..." : "");

    task.description = description;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task description from ${oldDescription} to ${newDescription}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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

    const oldStatus = task.status;

    task.status = status;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task status from ${oldStatus} to ${status}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskAssignees = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignees } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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

    const oldAssignees = task.assignees;

    task.assignees = assignees;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task assignees from ${oldAssignees.length} to ${assignees.length}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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

    const oldPriority = task.priority;

    task.priority = priority;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task priority from ${oldPriority} to ${priority}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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

    const newSubTask = {
      title,
      completed: false,
    };

    task.subtasks.push(newSubTask);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
      description: `created subtask ${title}`,
    });

    res.status(201).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const subTask = task.subtasks.find(
      (subTask) => subTask._id.toString() === subTaskId
    );

    if (!subTask) {
      return res.status(404).json({
        message: "Subtask not found",
      });
    }

    subTask.completed = completed;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
      description: `updated subtask ${subTask.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getActivityByResourceId = async (req, res) => {
  try {
    const startTime = Date.now();
    const { resourceId } = req.params;

    // Use aggregation for much better performance
    const activity = await ActivityLog.aggregate([
      { $match: { resourceId: new mongoose.Types.ObjectId(resourceId) } },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          action: 1,
          resourceType: 1,
          resourceId: 1,
          resourceName: 1,
          details: 1,
          createdAt: 1,
          updatedAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1
        }
      }
    ]);

    console.log(`[PERF] Activity query for ${resourceId}: ${Date.now() - startTime}ms (${activity.length} items)`);
    res.status(200).json(activity);
  } catch (error) {
    console.log("[ERROR] Activity query error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommentsByTaskId = async (req, res) => {
  try {
    const startTime = Date.now();
    const { taskId } = req.params;

    // Use aggregation for better performance
    const comments = await Comment.aggregate([
      { $match: { task: new mongoose.Types.ObjectId(taskId) } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          text: 1,  // Use 'text' to match the schema
          content: "$text", // Also provide as 'content' for frontend compatibility
          task: 1,
          createdAt: 1,
          updatedAt: 1,
          "author._id": 1,
          "author.name": 1,
          "author.email": 1
        }
      }
    ]);

    console.log(`[PERF] Comments query for ${taskId}: ${Date.now() - startTime}ms (${comments.length} items)`);
    res.status(200).json(comments);
  } catch (error) {
    console.log("[ERROR] Comments query error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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

    const newComment = await Comment.create({
      text,
      task: taskId,
      author: req.user._id,
    });

    task.comments.push(newComment._id);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "added_comment", "Task", taskId, {
      description: `added comment ${
        text.substring(0, 50) + (text.length > 50 ? "..." : "")
      }`,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const watchTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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

    const isWatching = task.watchers.includes(req.user._id);

    if (!isWatching) {
      task.watchers.push(req.user._id);
    } else {
      task.watchers = task.watchers.filter(
        (watcher) => watcher.toString() !== req.user._id.toString()
      );
    }

    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `${
        isWatching ? "stopped watching" : "started watching"
      } task ${task.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const achievedTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

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
    const isAchieved = task.isArchived;

    task.isArchived = !isAchieved;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `${isAchieved ? "unarchived" : "archived"} task ${
        task.title
      }`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
      .populate("project", "title workspace")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check if user has access to this task
    const project = await Project.findById(task.project);
    const workspace = await Workspace.findById(project.workspace);

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      // Delete uploaded file if user doesn't have access
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        message: "You don't have access to this task",
      });
    }

    const attachment = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/attachments/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    };

    task.attachments.push(attachment);
    await task.save();

    await recordActivity({
      user: req.user._id,
      action: "uploaded",
      resourceType: "attachment",
      resourceId: task._id,
      resourceName: req.file.originalname,
      workspace: workspace._id,
    });

    res.status(200).json({
      message: "File uploaded successfully",
      attachment: task.attachments[task.attachments.length - 1],
    });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addLinkAttachment = async (req, res) => {
  try {
    console.log("[ADD LINK] Request received:", { taskId: req.params.taskId, body: req.body });
    const { taskId } = req.params;
    const { name, url } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      console.log("[ADD LINK] Task not found:", taskId);
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check if user has access to this task
    const project = await Project.findById(task.project);
    const workspace = await Workspace.findById(project.workspace);

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      console.log("[ADD LINK] Access denied for user:", req.user._id);
      return res.status(403).json({
        message: "You don't have access to this task",
      });
    }

    const attachment = {
      fileName: name,
      fileUrl: url,
      fileType: "link",
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    };

    task.attachments.push(attachment);
    await task.save();
    console.log("[ADD LINK] Link attachment added successfully");

    await recordActivity({
      user: req.user._id,
      action: "added",
      resourceType: "link",
      resourceId: task._id,
      resourceName: name,
      workspace: workspace._id,
    });

    res.status(200).json({
      message: "Link added successfully",
      attachment: task.attachments[task.attachments.length - 1],
    });
  } catch (error) {
    console.error("[ADD LINK] Error adding link:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check if user has access to this task
    const project = await Project.findById(task.project);
    const workspace = await Workspace.findById(project.workspace);

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You don't have access to this task",
      });
    }

    const attachmentIndex = task.attachments.findIndex(
      (att) => att._id.toString() === attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    const attachment = task.attachments[attachmentIndex];

    // Delete file from disk if it's not a link
    if (attachment.fileType !== "link" && attachment.fileUrl) {
      const filePath = path.join(process.cwd(), attachment.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    await recordActivity({
      user: req.user._id,
      action: "deleted",
      resourceType: "attachment",
      resourceId: task._id,
      resourceName: attachment.fileName,
      workspace: workspace._id,
    });

    res.status(200).json({
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { 
  createTask,
  getTaskById,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskAssignees,
  updateTaskPriority,
  addSubTask,
  updateSubTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  addComment,
  watchTask,
  achievedTask,
  getMyTasks,
  uploadAttachment,
  addLinkAttachment,
  deleteAttachment
};