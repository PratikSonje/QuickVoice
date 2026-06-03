import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../../common/errors/badRequest.js";
import { authorized } from "../../middleware/authorize.middleware.js";
import * as mcpService from "./mcp.service.js";

const getStringParam = (value: string | string[] | undefined, name: string) => {
  if (!value || Array.isArray(value)) {
    throw new BadRequestError(`${name} is required`);
  }
  return value;
};

export const listCatalog = authorized(async (req, res) => {
  const catalog = await mcpService.listCatalog(req.auth.activeOrganizationId);
  res.status(StatusCodes.OK).json({ success: true, message: "MCP catalog fetched successfully", data: catalog });
});

export const listConnections = authorized(async (req, res) => {
  const connections = await mcpService.listConnections(req.auth.activeOrganizationId);
  res.status(StatusCodes.OK).json({ success: true, message: "MCP connections fetched successfully", data: connections });
});

export const connect = authorized(async (req, res) => {
  const connection = await mcpService.connect(req.auth.activeOrganizationId, req.auth.userId, req.body);
  res.status(StatusCodes.CREATED).json({ success: true, message: "MCP connection created successfully", data: connection });
});

export const refreshConnection = authorized(async (req, res) => {
  const mcpConnectionId = getStringParam(req.params.mcpConnectionId, "MCP connection ID");
  const connection = await mcpService.refreshConnection(req.auth.activeOrganizationId, mcpConnectionId);
  res.status(StatusCodes.OK).json({ success: true, message: "MCP connection refreshed successfully", data: connection });
});

export const listAgentConnections = authorized(async (req, res) => {
  const agentId = getStringParam(req.params.agentId, "Agent ID");
  const connections = await mcpService.listAgentConnections(req.auth.activeOrganizationId, agentId);
  res.status(StatusCodes.OK).json({ success: true, message: "Agent MCP connections fetched successfully", data: connections });
});

export const attach = authorized(async (req, res) => {
  const mcpConnectionId = getStringParam(req.params.mcpConnectionId, "MCP connection ID");
  const agentId = getStringParam(req.params.agentId, "Agent ID");
  const result = await mcpService.attach(req.auth.activeOrganizationId, agentId, mcpConnectionId, req.body.enabled ?? true);
  res.status(StatusCodes.OK).json({ success: true, message: "MCP connection attached successfully", data: result });
});

export const detach = authorized(async (req, res) => {
  const mcpConnectionId = getStringParam(req.params.mcpConnectionId, "MCP connection ID");
  const agentId = getStringParam(req.params.agentId, "Agent ID");
  await mcpService.detach(req.auth.activeOrganizationId, agentId, mcpConnectionId);
  res.status(StatusCodes.OK).json({ success: true, message: "MCP connection detached successfully", data: null });
});

export const disconnect = authorized(async (req, res) => {
  const mcpConnectionId = getStringParam(req.params.mcpConnectionId, "MCP connection ID");
  await mcpService.disconnect(req.auth.activeOrganizationId, mcpConnectionId);
  res.status(StatusCodes.OK).json({ success: true, message: "MCP connection disconnected successfully", data: null });
});

export const executeTool = authorized(async (req, res) => {
  const mcpConnectionId = getStringParam(req.params.mcpConnectionId, "MCP connection ID");
  const toolName = getStringParam(req.params.toolName, "MCP tool name");
  const result = await mcpService.executeTool(req.auth.activeOrganizationId, mcpConnectionId, toolName, req.body);
  res.status(StatusCodes.OK).json({ success: true, message: "MCP tool executed successfully", data: result });
});
