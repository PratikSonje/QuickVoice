import asyncio
import json
import os
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen


def build_mcp_tool_instructions(connections: list[dict[str, Any]]) -> str:
    lines: list[str] = []
    for connection in connections or []:
        if connection.get("status") != "CONNECTED":
            continue
        tools = connection.get("tools") or []
        if not tools:
            continue
        connection_id = connection.get("mcpConnectionId")
        display_name = connection.get("displayName") or "MCP connection"
        tool_names = ", ".join(str(tool.get("name")) for tool in tools if tool.get("name"))
        if connection_id and tool_names:
            lines.append(f"- {display_name} connection_id={connection_id}; tools: {tool_names}")

    if not lines:
        return ""

    return (
        "\n\nConnected MCP tools are available through call_mcp_tool. "
        "Use the exact connection_id and tool_name from this list:\n" + "\n".join(lines)
    )


async def call_mcp_tool(
    *,
    connection_id: str,
    tool_name: str,
    arguments: dict[str, Any],
    config: dict[str, Any],
    call_context: dict[str, Any],
):
    base_url = (os.getenv("SERVER_API_URL") or "").rstrip("/")
    api_key = os.getenv("INTERNAL_API_KEY")
    if not base_url:
        raise RuntimeError("SERVER_API_URL is required to execute MCP tools")
    if not api_key:
        raise RuntimeError("INTERNAL_API_KEY is required to execute MCP tools")

    api_base_url = base_url if base_url.endswith("/api/v1") else f"{base_url}/api/v1"
    encoded_connection_id = quote(connection_id, safe="")
    encoded_tool_name = quote(tool_name, safe="")
    url = f"{api_base_url}/mcp/connections/{encoded_connection_id}/tools/{encoded_tool_name}/execute"
    payload = {
        "organizationId": config.get("organization_id"),
        "userId": config.get("user_id") or "internal",
        "agentId": config.get("agent_id"),
        "callId": call_context.get("call_id"),
        "arguments": arguments or {},
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "x-organization-id": str(config.get("organization_id") or ""),
        "x-user-id": str(config.get("user_id") or "internal"),
    }
    return await asyncio.to_thread(_post_json, url, headers, payload)


def parse_arguments_json(arguments_json: str | None) -> dict[str, Any]:
    if not arguments_json:
        return {}
    try:
        parsed = json.loads(arguments_json)
    except Exception as exc:
        raise ValueError("arguments_json must be valid JSON") from exc
    if not isinstance(parsed, dict):
        raise ValueError("arguments_json must decode to an object")
    return parsed


def _post_json(url: str, headers: dict[str, str], payload: dict[str, Any]):
    body = json.dumps(payload).encode("utf-8")
    request = Request(url, data=body, headers=headers, method="POST")
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))
