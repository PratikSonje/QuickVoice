import assert from "node:assert/strict";
import { test } from "node:test";

import { importBatchCampaignRecipients } from "../../src/modules/outbound/outbound-batch.service.js";

test("importBatchCampaignRecipients persists valid and invalid file rows and schedules dispatch", async () => {
  const calls: unknown[] = [];
  const now = new Date("2026-06-21T10:00:00.000Z");
  const scheduledAt = new Date("2026-06-21T10:05:00.000Z");
  const csv = [
    "phone_number,language,voice_id,first_message,prompt,city,other_dyn_variable",
    "+15550001111,hi-IN,aura-2-athena-en,Hi {{city}},Prompt {{other_dyn_variable}},Mumbai,renewal",
    ",en-US,aura-2-asteria-en,Hi,Prompt,Austin,value",
  ].join("\n");

  const repo = {
    getCampaignForImport: async (campaignId: string) => {
      calls.push(["loadCampaign", campaignId]);
      return {
        campaignId,
        organizationId: "org_123",
        userId: "user_123",
        agentId: "8d55565f-1111-4111-8111-f95fd03f0df2",
        fromNumber: "+15551230000",
        scheduledAt,
        sourceFileKey: "outbound-batches/org_123/file.csv",
        sourceFileName: "file.csv",
        ringingTimeoutSeconds: 45,
      };
    },
    createBatchOutboundCalls: async (rows: unknown[]) => {
      calls.push(["createRows", rows]);
      return rows;
    },
    markBatchImported: async (campaignId: string, stats: unknown) => {
      calls.push(["markImported", campaignId, stats]);
    },
  };
  const queue = {
    add: async (...args: unknown[]) => {
      calls.push(["queue", ...args]);
    },
  };

  await importBatchCampaignRecipients(
    { campaignId: "campaign_123" },
    {
      repository: repo,
      queue,
      readFile: async (key) => {
        calls.push(["readFile", key]);
        return Buffer.from(csv);
      },
      now: () => now,
    }
  );

  const createRows = calls.find((call) => (call as unknown[])[0] === "createRows") as any[];
  assert.equal(createRows[1].length, 2);
  assert.deepEqual(createRows[1][0], {
    organizationId: "org_123",
    userId: "user_123",
    agentId: "8d55565f-1111-4111-8111-f95fd03f0df2",
    campaignId: "campaign_123",
    scheduledAt,
    phoneNumber: "+15550001111",
    fromNumber: "+15551230000",
    firstMessage: "Hi {{city}}",
    systemPrompt: "Prompt {{other_dyn_variable}}",
    mode: "campaign",
    status: "SCHEDULED",
    optionalData: {
      rowNumber: 2,
      language: "hi-IN",
      voiceId: "aura-2-athena-en",
      dynamicVariables: {
        city: "Mumbai",
        other_dyn_variable: "renewal",
      },
      ringingTimeoutSeconds: 45,
      sourceFileName: "file.csv",
    },
  });
  assert.equal(createRows[1][1].status, "FAILED");
  assert.equal(createRows[1][1].optionalData.importError, "phone_number is required");

  assert.deepEqual(calls.find((call) => (call as unknown[])[0] === "markImported"), [
    "markImported",
    "campaign_123",
    {
      totalRecipients: 2,
      validRecipients: 1,
      invalidRecipients: 1,
    },
  ]);
  assert.deepEqual(calls.find((call) => (call as unknown[])[0] === "queue"), [
    "queue",
    "dispatch-campaign",
    { campaignId: "campaign_123" },
    {
      delay: 300000,
      jobId: "outbound-batch-dispatch:campaign_123",
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  ]);
});
