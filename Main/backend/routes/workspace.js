import express from "express";
import { validateRequest } from "zod-express-middleware";
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkspace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
  getOverallStats,
  updateWorkspace,
  deleteWorkspace,
  transferOwnership,
} from "../controllers/workspace.js";
import {
  tokenSchema,
  workspaceSchema,
} from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { z } from "zod";

const router = express.Router();

router.post("/",
    authMiddleware,
    validateRequest({ body: workspaceSchema }),
    createWorkspace
);

router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);

router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGenerateInvite
);

router.get("/", authMiddleware, getWorkspaces);

router.get("/overall-stats", authMiddleware, getOverallStats);

router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);

router.put(
  "/:workspaceId",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: workspaceSchema,
  }),
  updateWorkspace
);

router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);

router.delete(
  "/:workspaceId",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  deleteWorkspace
);

router.post(
  "/:workspaceId/transfer-ownership",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: z.object({ newOwnerId: z.string() }),
  }),
  transferOwnership
);

export default router;