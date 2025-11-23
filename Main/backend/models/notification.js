import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "workspace_created",
        "added_to_workspace",
        "added_to_project",
        "assigned_to_task",
        "task_description_updated",
        "task_status_updated",
        "task_priority_updated",
        "task_due_date_updated",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["Workspace", "Project", "Task"],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
