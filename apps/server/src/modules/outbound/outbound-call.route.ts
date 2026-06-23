import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { BadRequestError } from "../../common/errors/badRequest.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/authorize.middleware.js";
import {
  batchUploadUrlQuerySchema,
  createBatchCampaignSchema,
  listBatchCampaignsQuerySchema,
  quickOutboundCallSchema,
} from "./outbound-call.schema.js";
import {
  createBatchCampaign,
  createBatchUploadUrl,
  getBatchCampaignDetail,
  listBatchCampaigns,
} from "./outbound-batch.service.js";
import { createQuickOutboundCall } from "./outbound-call.service.js";

type Middleware = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
type CreateQuickOutboundCall = typeof createQuickOutboundCall;
type CreateBatchCampaign = typeof createBatchCampaign;
type CreateBatchUploadUrl = typeof createBatchUploadUrl;
type ListBatchCampaigns = typeof listBatchCampaigns;
type GetBatchCampaignDetail = typeof getBatchCampaignDetail;

type OutboundCallRouterDeps = {
  authMiddleware?: Middleware;
  requireCreatePermission?: Middleware;
  createQuickOutboundCall?: CreateQuickOutboundCall;
  createBatchCampaign?: CreateBatchCampaign;
  createBatchUploadUrl?: CreateBatchUploadUrl;
  listBatchCampaigns?: ListBatchCampaigns;
  getBatchCampaignDetail?: GetBatchCampaignDetail;
};

export function createOutboundCallRouter(deps: OutboundCallRouterDeps = {}) {
  const router = Router();
  const authenticate = deps.authMiddleware ?? authMiddleware;
  const authorize =
    deps.requireCreatePermission ?? requirePermission({ outboundCalls: ["create"] });
  const dispatchQuickCall = deps.createQuickOutboundCall ?? createQuickOutboundCall;
  const createBatch = deps.createBatchCampaign ?? createBatchCampaign;
  const createUploadUrl = deps.createBatchUploadUrl ?? createBatchUploadUrl;
  const listBatches = deps.listBatchCampaigns ?? listBatchCampaigns;
  const getBatchDetail = deps.getBatchCampaignDetail ?? getBatchCampaignDetail;

  router.post(
    "/quick",
    authenticate,
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestAuth = req.auth;
        if (!requestAuth?.activeOrganizationId) {
          throw new BadRequestError("Active organization is required");
        }

        const input = quickOutboundCallSchema.parse(req.body);
        const data = await dispatchQuickCall({
          ...input,
          organizationId: requestAuth.activeOrganizationId,
          userId: requestAuth.userId,
        });

        res.status(StatusCodes.CREATED).json({
          success: true,
          message: "Outbound call dispatched successfully",
          data,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/batch-upload-url",
    authenticate,
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestAuth = req.auth;
        if (!requestAuth?.activeOrganizationId) {
          throw new BadRequestError("Active organization is required");
        }

        const query = batchUploadUrlQuerySchema.parse(req.query);
        const data = await createUploadUrl({
          ...query,
          organizationId: requestAuth.activeOrganizationId,
        });

        res.status(StatusCodes.OK).json({
          success: true,
          message: "Batch upload URL generated",
          data,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/batches",
    authenticate,
    authorize,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestAuth = req.auth;
        if (!requestAuth?.activeOrganizationId) {
          throw new BadRequestError("Active organization is required");
        }

        const input = createBatchCampaignSchema.parse(req.body);
        const data = await createBatch({
          ...input,
          organizationId: requestAuth.activeOrganizationId,
          userId: requestAuth.userId,
        });

        res.status(StatusCodes.CREATED).json({
          success: true,
          message: "Batch campaign created",
          data,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/batches",
    authenticate,
    requirePermission({ outboundCalls: ["read"] }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestAuth = req.auth;
        if (!requestAuth?.activeOrganizationId) {
          throw new BadRequestError("Active organization is required");
        }

        const query = listBatchCampaignsQuerySchema.parse(req.query);
        const data = await listBatches({
          ...query,
          organizationId: requestAuth.activeOrganizationId,
        });

        res.status(StatusCodes.OK).json({
          success: true,
          message: "Batch campaigns fetched successfully",
          data,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/batches/:campaignId",
    authenticate,
    requirePermission({ outboundCalls: ["read"] }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestAuth = req.auth;
        if (!requestAuth?.activeOrganizationId) {
          throw new BadRequestError("Active organization is required");
        }
        const campaignIdParam = req.params.campaignId;
        const campaignId = Array.isArray(campaignIdParam)
          ? campaignIdParam[0]
          : campaignIdParam;
        if (!campaignId) {
          throw new BadRequestError("Campaign id is required");
        }

        const data = await getBatchDetail({
          organizationId: requestAuth.activeOrganizationId,
          campaignId,
        });

        res.status(StatusCodes.OK).json({
          success: true,
          message: "Batch campaign fetched successfully",
          data,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

export default createOutboundCallRouter();
