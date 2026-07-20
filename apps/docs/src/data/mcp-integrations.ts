export type McpIntegration = {
  name: string;
  description: string;
  initials: string;
};

export const mcpIntegrations: McpIntegration[] = [
  { name: "Cursor", description: "AI code editor", initials: "CU" },
  { name: "Windsurf", description: "AI code editor", initials: "WS" },
  { name: "Claude Desktop", description: "Desktop MCP client", initials: "CD" },
  { name: "Claude Code", description: "CLI assistant", initials: "CC" },
  { name: "Codex", description: "OpenAI coding agent", initials: "OX" },
  { name: "VS Code", description: "Editor clients", initials: "VS" },
  { name: "GitHub Copilot", description: "IDE assistant", initials: "GH" },
  { name: "JetBrains", description: "IDE clients", initials: "JB" },
  { name: "OpenHands", description: "Development agent", initials: "OH" },
  { name: "Other MCP clients", description: "Streamable HTTP", initials: "MC" },
];
