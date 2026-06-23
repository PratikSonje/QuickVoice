import {
  CallStatus,
  OutboundCallMode,
  Prisma,
  TelephonyProvider,
} from "../../../prisma/generated/prisma/client.js";
import {
  LIVEKIT_AGENT_NAME,
  LIVEKIT_SIP_OUTBOUND_TRUNK_TELNYX_ID,
  LIVEKIT_SIP_OUTBOUND_TRUNK_TWILIO_ID,
  livekitAgentDispatchClient,
  livekitSipClient,
} from "../../config/livekit.js";
import { BadRequestError } from "../../common/errors/badRequest.js";
import type { QuickOutboundCallArgs } from "./outbound-call.schema.js";
import * as outboundCallRepository from "./outbound-call.repository.js";

type OutboundCallRepository = {
  getDialableNumber: typeof outboundCallRepository.getDialableNumber;
  getOutboundCallForDispatch?: typeof outboundCallRepository.getOutboundCallForDispatch;
  createQuickCall: typeof outboundCallRepository.createQuickCall;
  markInProgress: typeof outboundCallRepository.markInProgress;
  markFailed: typeof outboundCallRepository.markFailed;
  getMonthlyUsage?: typeof outboundCallRepository.getMonthlyUsage;
};

type SipClientLike = {
  createSipParticipant: (
    sipTrunkId: string,
    number: string,
    roomName: string,
    opts?: Record<string, unknown>
  ) => Promise<unknown>;
};

type AgentDispatchClientLike = {
  createDispatch: (
    roomName: string,
    agentName: string,
    options?: { metadata?: string }
  ) => Promise<unknown>;
  deleteDispatch?: (dispatchId: string, roomName: string) => Promise<void>;
};

type OutboundTrunks = Record<TelephonyProvider, string>;

type CreateQuickOutboundCallDeps = {
  repository?: OutboundCallRepository;
  sipClient?: SipClientLike;
  dispatchClient?: AgentDispatchClientLike;
  outboundTrunks?: OutboundTrunks;
  agentName?: string;
};

const defaultOutboundTrunks: OutboundTrunks = {
  [TelephonyProvider.TWILIO]: LIVEKIT_SIP_OUTBOUND_TRUNK_TWILIO_ID,
  [TelephonyProvider.TELNYX]: LIVEKIT_SIP_OUTBOUND_TRUNK_TELNYX_ID,
};

export async function createQuickOutboundCall(
  args: QuickOutboundCallArgs,
  deps: CreateQuickOutboundCallDeps = {}
) {
  const repository = deps.repository ?? outboundCallRepository;
  const sipClient = deps.sipClient ?? livekitSipClient;
  const dispatchClient = deps.dispatchClient ?? livekitAgentDispatchClient;
  const outboundTrunks = deps.outboundTrunks ?? defaultOutboundTrunks;
  const agentName = deps.agentName ?? LIVEKIT_AGENT_NAME;

  await enforcePlanQuota(repository, args.organizationId);

  const dialableNumber = await repository.getDialableNumber({
    organizationId: args.organizationId,
    agentId: args.agentId,
    fromNumber: args.fromNumber,
  });

  if (!dialableNumber) {
    throw new BadRequestError(
      "From number must belong to this organization and be linked to the selected agent"
    );
  }

  const provider = args.provider ?? dialableNumber.provider;
  const sid = args.sid ?? dialableNumber.sid;
  const trunkId = outboundTrunks[provider];

  if (!trunkId) {
    throw new BadRequestError(`LiveKit outbound trunk is not configured for ${provider}`);
  }

  const outbound = await repository.createQuickCall({
    ...args,
    provider,
    sid,
    status: CallStatus.SCHEDULED,
    mode: OutboundCallMode.quick,
    optionalData: {
      username: args.username ?? null,
      provider,
      sid,
    },
  });

  try {
    const roomName = `outbound_${outbound.outboundId}`;
    const metadata = buildOutboundMetadata(
      { ...args, provider, sid },
      outbound.outboundId
    );
    const metadataJson = JSON.stringify(metadata);
    let agentDispatch: unknown;
    try {
      agentDispatch = await dispatchClient.createDispatch(roomName, agentName, {
        metadata: metadataJson,
      });
      const livekitParticipant = await sipClient.createSipParticipant(
        trunkId,
        args.phoneNumber,
        roomName,
        {
          fromNumber: args.fromNumber,
          participantIdentity: `outbound-${outbound.outboundId}`,
          participantName: args.username,
          participantMetadata: metadataJson,
          waitUntilAnswered: false,
        }
      );

      const updated = await repository.markInProgress(
        outbound.outboundId,
        {
          username: args.username ?? null,
          provider,
          sid,
          livekitParticipant: toJsonValue(livekitParticipant),
          agentDispatch: toJsonValue(agentDispatch),
        }
      );

      return { outbound: updated, livekitParticipant, agentDispatch };
    } catch (error) {
      await cleanupAgentDispatch(dispatchClient, agentDispatch, roomName);
      throw error;
    }
  } catch (error) {
    await repository.markFailed(
      outbound.outboundId,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

export async function dispatchScheduledOutboundCall(
  outboundId: string,
  deps: CreateQuickOutboundCallDeps = {}
) {
  const repository = deps.repository ?? outboundCallRepository;
  const sipClient = deps.sipClient ?? livekitSipClient;
  const dispatchClient = deps.dispatchClient ?? livekitAgentDispatchClient;
  const outboundTrunks = deps.outboundTrunks ?? defaultOutboundTrunks;
  const agentName = deps.agentName ?? LIVEKIT_AGENT_NAME;

  if (!repository.getOutboundCallForDispatch) {
    throw new Error("Outbound dispatch repository method is not configured");
  }

  const outbound = await repository.getOutboundCallForDispatch(outboundId);
  if (!outbound) {
    throw new BadRequestError("Outbound call not found or is not scheduled");
  }
  if (!outbound.agentId) {
    throw new BadRequestError("Outbound call is not linked to an agent");
  }

  await enforcePlanQuota(repository, outbound.organizationId);

  const dialableNumber = await repository.getDialableNumber({
    organizationId: outbound.organizationId,
    agentId: outbound.agentId,
    fromNumber: outbound.fromNumber,
  });

  if (!dialableNumber) {
    throw new BadRequestError(
      "From number must belong to this organization and be linked to the selected agent"
    );
  }

  const provider = dialableNumber.provider;
  const sid = dialableNumber.sid;
  const trunkId = outboundTrunks[provider];
  if (!trunkId) {
    throw new BadRequestError(`LiveKit outbound trunk is not configured for ${provider}`);
  }

  const optionalData = asRecord(outbound.optionalData);
  const language = stringValue(optionalData.language);
  const voiceId = stringValue(optionalData.voiceId) ?? stringValue(optionalData.voice_id);
  const dynamicVariables = asRecord(optionalData.dynamicVariables ?? optionalData.dynamic_variables);
  const ringingTimeoutSeconds = numberValue(optionalData.ringingTimeoutSeconds);

  try {
    const roomName = `outbound_${outbound.outboundId}`;
    const metadata = {
      agent_id: outbound.agentId,
      outbound_id: outbound.outboundId,
      campaign_id: outbound.campaignId ?? null,
      direction: "outbound",
      from_number: outbound.fromNumber,
      to_number: outbound.phoneNumber,
      provider,
      first_message: outbound.firstMessage ?? null,
      system_prompt: outbound.systemPrompt ?? null,
      language,
      voice_id: voiceId,
      dynamic_variables: Object.keys(dynamicVariables).length > 0 ? dynamicVariables : null,
    };
    const metadataJson = JSON.stringify(metadata);
    let agentDispatch: unknown;
    try {
      agentDispatch = await dispatchClient.createDispatch(roomName, agentName, {
        metadata: metadataJson,
      });
      const livekitParticipant = await sipClient.createSipParticipant(
        trunkId,
        outbound.phoneNumber,
        roomName,
        {
          fromNumber: outbound.fromNumber,
          participantIdentity: `outbound-${outbound.outboundId}`,
          participantMetadata: metadataJson,
          waitUntilAnswered: false,
          ...(ringingTimeoutSeconds ? { ringingTimeout: ringingTimeoutSeconds } : {}),
        }
      );

      const updated = await repository.markInProgress(outbound.outboundId, {
        ...optionalData,
        provider,
        sid,
        livekitParticipant: toJsonValue(livekitParticipant),
        agentDispatch: toJsonValue(agentDispatch),
      });

      return { outbound: updated, livekitParticipant, agentDispatch };
    } catch (error) {
      await cleanupAgentDispatch(dispatchClient, agentDispatch, roomName);
      throw error;
    }
  } catch (error) {
    await repository.markFailed(
      outbound.outboundId,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function enforcePlanQuota(
  repository: OutboundCallRepository,
  organizationId: string
) {
  const usage = await repository.getMonthlyUsage?.(organizationId);
  if (!usage?.includedMinutes) return;

  if (usage.usedSeconds >= usage.includedMinutes * 60) {
    throw new BadRequestError(
      "Plan minutes exhausted for the current billing period"
    );
  }
}

async function cleanupAgentDispatch(
  dispatchClient: AgentDispatchClientLike,
  agentDispatch: unknown,
  roomName: string
) {
  const dispatchId = getDispatchId(agentDispatch);
  if (!dispatchId || !dispatchClient.deleteDispatch) return;

  try {
    await dispatchClient.deleteDispatch(dispatchId, roomName);
  } catch (cleanupError) {
    console.warn("[outbound] failed to clean up LiveKit agent dispatch", {
      roomName,
      dispatchId,
      error:
        cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
    });
  }
}

function getDispatchId(agentDispatch: unknown) {
  if (!agentDispatch || typeof agentDispatch !== "object") return null;
  const dispatch = agentDispatch as {
    id?: unknown;
    dispatchId?: unknown;
    agentDispatchId?: unknown;
  };
  const id = dispatch.id ?? dispatch.dispatchId ?? dispatch.agentDispatchId;
  return typeof id === "string" && id.length > 0 ? id : null;
}

function buildOutboundMetadata(args: QuickOutboundCallArgs, outboundId: string) {
  return {
    agent_id: args.agentId,
    outbound_id: outboundId,
    direction: "outbound",
    from_number: args.fromNumber,
    to_number: args.phoneNumber,
    provider: args.provider,
    first_message: args.firstMessage ?? null,
    system_prompt: args.systemPrompt ?? null,
    username: args.username ?? null,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | null {
  if (value === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return String(value);
  }
}
