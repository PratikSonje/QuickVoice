import { NotFoundError } from "../../common/errors/notFound.js";
import * as calllogRepository from "./calllog.repository.js";
import type {
  IngestCallLogArgs,
  ListCallLogsArgs,
  ListTranscriptsArgs,
} from "./calllog.schema.js";

export const ingestCallLog = (args: IngestCallLogArgs) =>{
  return calllogRepository.saveCallLog(args);
};

export const listCallLogs = async (args: ListCallLogsArgs) => {
  // Repository over-fetches by one row; we trim here and hand back the
  // trailing callId as the next cursor so the caller can walk forward.
  const rows = await calllogRepository.listByOrg(args);
  const hasMore = rows.length > args.limit;
  const items = hasMore ? rows.slice(0, args.limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]!.callId : null;
  return { items, nextCursor };
};

export const getCallLog = async (organizationId: string, callId: string) => {
  const row = await calllogRepository.getCallByIdForOrg(callId, organizationId);
  if (!row) {
    throw new NotFoundError("Call log not found");
  }
  return row;
};

export const getTranscripts = async (args: ListTranscriptsArgs) => {
  const rows = await calllogRepository.getTranscriptsByCallId(args);
  const hasMore = rows.length > args.limit;
  const items = hasMore ? rows.slice(0, args.limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]!.callTransId : null;
  return { items, nextCursor };
};

export const deleteCallLog = async (
  organizationId: string,
  callId: string
) => {
  const ok = await calllogRepository.deleteCallLog(callId, organizationId);
  if (!ok) {
    throw new NotFoundError("Call log not found");
  }
};
