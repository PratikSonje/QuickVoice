import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import type { Server } from "node:http";

let server: Server;
let baseUrl: string;
let serviceArgs: unknown[] = [];
let batchArgs: unknown[] = [];
let uploadUrlArgs: unknown[] = [];

before(async () => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_placeholder";
  process.env.BETTER_AUTH_URL ||= "http://localhost:5000";
  process.env.BETTER_AUTH_SECRET ||= "test-secret-with-adequate-length-32chars";
  process.env.GOOGLE_CLIENT_ID ||= "test-google-client-id";
  process.env.GOOGLE_CLIENT_SECRET ||= "test-google-client-secret";
  const { createOutboundCallRouter } = await import("../../src/modules/outbound/outbound-call.route.js");
  const app = express();
  app.use(express.json());
  app.use(
    "/api/v1/outbound-calls",
    createOutboundCallRouter({
      authMiddleware: (req: Request, _res: Response, next: NextFunction) => {
        req.auth = {
          userId: "user_123",
          activeOrganizationId: "org_123",
          authMethod: "session",
          session: null,
        };
        next();
      },
      requireCreatePermission: (_req: Request, _res: Response, next: NextFunction) => next(),
      createQuickOutboundCall: async (args) => {
        serviceArgs.push(args);
        return {
          outbound: { outboundId: "2b1f6d53-42f5-4cc7-9689-7b6f51a0c113", status: "IN_PROGRESS" },
          livekitParticipant: { participantId: "sip-participant-123" },
        };
      },
      createBatchCampaign: async (args) => {
        batchArgs.push(args);
        return {
          campaignId: "campaign_123",
          status: "SCHEDULED",
          name: args.name,
        };
      },
      createBatchUploadUrl: async (args) => {
        uploadUrlArgs.push(args);
        return {
          uploadUrl: "https://s3.example.test/upload",
          s3Key: "outbound-batches/org_123/recipients.csv",
        };
      },
    })
  );

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("POST /quick validates and dispatches a quick outbound call", async () => {
  serviceArgs = [];
  const response = await fetch(`${baseUrl}/api/v1/outbound-calls/quick`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "8d55565f-1111-4111-8111-f95fd03f0df2",
      phoneNumber: "+15550001111",
      fromNumber: "+15551230000",
      username: "Ada",
    }),
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.outbound.outboundId, "2b1f6d53-42f5-4cc7-9689-7b6f51a0c113");
  assert.equal(serviceArgs.length, 1);
  assert.deepEqual(serviceArgs[0], {
    organizationId: "org_123",
    userId: "user_123",
    agentId: "8d55565f-1111-4111-8111-f95fd03f0df2",
    phoneNumber: "+15550001111",
    fromNumber: "+15551230000",
    username: "Ada",
  });
});

test("GET /batch-upload-url returns a presigned outbound batch upload target", async () => {
  uploadUrlArgs = [];
  const response = await fetch(
    `${baseUrl}/api/v1/outbound-calls/batch-upload-url?fileName=recipients.csv&contentType=text/csv`
  );

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.uploadUrl, "https://s3.example.test/upload");
  assert.deepEqual(uploadUrlArgs[0], {
    organizationId: "org_123",
    fileName: "recipients.csv",
    contentType: "text/csv",
  });
});

test("POST /batches validates and creates a scheduled batch campaign", async () => {
  batchArgs = [];
  const response = await fetch(`${baseUrl}/api/v1/outbound-calls/batches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "June renewals",
      agentId: "8d55565f-1111-4111-8111-f95fd03f0df2",
      fromNumber: "+15551230000",
      sourceFileKey: "outbound-batches/org_123/recipients.csv",
      sourceFileName: "recipients.csv",
      scheduledAt: "2026-06-21T10:05:00.000Z",
      timezone: "UTC",
      ringingTimeoutSeconds: 45,
    }),
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.campaignId, "campaign_123");
  assert.deepEqual(batchArgs[0], {
    organizationId: "org_123",
    userId: "user_123",
    name: "June renewals",
    agentId: "8d55565f-1111-4111-8111-f95fd03f0df2",
    fromNumber: "+15551230000",
    sourceFileKey: "outbound-batches/org_123/recipients.csv",
    sourceFileName: "recipients.csv",
    scheduledAt: new Date("2026-06-21T10:05:00.000Z"),
    timezone: "UTC",
    ringingTimeoutSeconds: 45,
  });
});
