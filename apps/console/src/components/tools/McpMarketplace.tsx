"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, PlugZap, ShieldCheck, Wrench } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useConnectMcp, useMcpCatalog, useOpenMcpSetup } from "@/src/hooks/queries/mcp";
import type { McpCatalogItem } from "@/src/lib/api/types";

const FALLBACK_CATALOG: McpCatalogItem[] = [
  {
    slug: "github",
    name: "GitHub",
    description: "Search repositories, inspect issues, and work with pull requests.",
    provider: "smithery",
    source: "SMITHERY",
    mcpUrl: "https://server.smithery.ai/github",
    smitheryServerKey: "github",
    authType: "oauth",
    categories: ["Developer tools", "Source control"],
    verified: true,
    toolCount: 0,
  },
  {
    slug: "slack",
    name: "Slack",
    description: "Read channels, search messages, and send team updates.",
    provider: "smithery",
    source: "SMITHERY",
    mcpUrl: "https://server.smithery.ai/slack",
    smitheryServerKey: "slack",
    authType: "oauth",
    categories: ["Communication"],
    verified: true,
    toolCount: 0,
  },
  {
    slug: "notion",
    name: "Notion",
    description: "Find pages, read workspace knowledge, and create structured notes.",
    provider: "smithery",
    source: "SMITHERY",
    mcpUrl: "https://server.smithery.ai/notion",
    smitheryServerKey: "notion",
    authType: "oauth",
    categories: ["Knowledge base", "Productivity"],
    verified: true,
    toolCount: 0,
  },
  {
    slug: "google-drive",
    name: "Google Drive",
    description: "Search files, read documents, and retrieve workspace context.",
    provider: "smithery",
    source: "SMITHERY",
    mcpUrl: "https://server.smithery.ai/googledrive",
    smitheryServerKey: "googledrive",
    authType: "oauth",
    categories: ["Knowledge base", "Documents"],
    verified: true,
    toolCount: 0,
  },
];

const hasMissingGoogleDriveScope = (metadata?: Record<string, unknown> | null) =>
  metadata?.scopeIssue === "missing_google_drive_scope";

function MarketplaceAction({
  item,
  isPending,
  onConnect,
  onSetup,
}: {
  item: McpCatalogItem;
  isPending: boolean;
  onConnect: () => void;
  onSetup: (setupUrl: string, mcpConnectionId: string) => void;
}) {
  const missingGoogleDriveScope = hasMissingGoogleDriveScope(item.metadata);

  if (missingGoogleDriveScope && item.setupUrl && item.mcpConnectionId) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetup(item.setupUrl as string, item.mcpConnectionId as string)}
      >
        <ExternalLink className="size-4" />
        Re-authorize
      </Button>
    );
  }

  if (item.connectionStatus === "CONNECTED" || item.connected) {
    return (
      <Badge className="gap-1 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
        <CheckCircle2 className="size-3" />
        Connected
      </Badge>
    );
  }

  if (item.connectionStatus === "AUTH_REQUIRED" || item.connectionStatus === "INPUT_REQUIRED") {
    return item.setupUrl && item.mcpConnectionId ? (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetup(item.setupUrl as string, item.mcpConnectionId as string)}
      >
        <ExternalLink className="size-4" />
        {missingGoogleDriveScope ? "Re-authorize" : "Setup"}
      </Button>
    ) : (
      <Badge className="gap-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 dark:text-blue-300">
        <AlertCircle className="size-3" />
        {missingGoogleDriveScope ? "Drive access not granted" : "Setup required"}
      </Badge>
    );
  }

  if (item.connectionStatus === "ERROR" || item.connectionStatus === "DISCONNECTED") {
    return (
      <Button variant="outline" size="sm" disabled={isPending} onClick={onConnect}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <AlertCircle className="size-4" />}
        Retry setup
      </Button>
    );
  }

  return (
    <Button size="sm" disabled={isPending} onClick={onConnect}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
      Connect
    </Button>
  );
}

export function McpMarketplace() {
  const { data, isError } = useMcpCatalog();
  const catalog = data?.length ? data : FALLBACK_CATALOG;
  const connectMcp = useConnectMcp();
  const openMcpSetup = useOpenMcpSetup();
  const [customUrl, setCustomUrl] = useState("");
  const [displayName, setDisplayName] = useState("");

  return (
    <div className="space-y-4">
      <div className="border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Custom MCP server</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Connect an HTTPS remote MCP server that is not in the verified catalog.
            </p>
          </div>
          <Badge variant="outline">Unverified</Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="custom-mcp-url">MCP URL</Label>
            <Input
              id="custom-mcp-url"
              value={customUrl}
              placeholder="https://example.com/mcp"
              onChange={(event) => setCustomUrl(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="custom-mcp-name">Name</Label>
            <Input
              id="custom-mcp-name"
              value={displayName}
              placeholder="Internal tools"
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>
          <Button
            className="self-end"
            disabled={!customUrl || connectMcp.isPending}
            onClick={() =>
              connectMcp.mutate({ customUrl, displayName: displayName || undefined })
            }
          >
            {connectMcp.isPending ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
            Connect
          </Button>
        </div>
      </div>

      {isError && (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          The API catalog is not available yet. Restart the API server to enable connection actions.
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {catalog.map((item) => (
          <div key={item.slug} className="border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center border bg-primary/10 text-primary">
                  <Wrench className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    {item.verified && (
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <ShieldCheck className="size-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  {hasMissingGoogleDriveScope(item.metadata) && (
                    <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                      On the Google consent screen, check Google Drive access before continuing.
                    </p>
                  )}
                </div>
              </div>
              <MarketplaceAction
                item={item}
                isPending={connectMcp.isPending}
                onConnect={() => connectMcp.mutate({ catalogSlug: item.slug })}
                onSetup={openMcpSetup}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-[10px]">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
