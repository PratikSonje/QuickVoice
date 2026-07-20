import { ChevronDown } from "lucide-react";
import { mcpClients } from "@/data/mcp-clients";
import { defaultMcpServerUrl, stringifyMcpConfig } from "@/lib/mcp-config";
import { McpCopyButton } from "./mcp-copy-button";
import { McpSectionHeading } from "./mcp-section-heading";

const sampleConfig = stringifyMcpConfig({ apiKey: "", serverUrl: defaultMcpServerUrl });

export function McpClientAccordion() {
  return (
    <section id="clients" className="border-y border-[var(--qv-border)] bg-[var(--qv-bg-muted)] px-4 py-20 sm:px-6 lg:px-8">
      <McpSectionHeading
        eyebrow="Client guides"
        title="Setup steps for popular MCP clients"
        description="Use the generated config block above, then follow the client-specific steps below."
      />
      <div className="mx-auto mt-10 max-w-5xl space-y-3">
        {mcpClients.map((client, index) => (
          <details key={client.id} className="group rounded-2xl border border-[var(--qv-border)] bg-white shadow-sm open:shadow-md" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--qv-blue)]/20">
              <span className="flex min-w-0 items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--qv-bg-muted)] font-mono text-sm font-bold text-[var(--qv-blue)] ring-1 ring-[var(--qv-border)]">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-950">{client.name}</span>
                  <span className="mt-1 block text-sm text-[var(--qv-muted)]">{client.description}</span>
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-slate-400 transition group-open:rotate-180 group-open:text-[var(--qv-blue)]" />
            </summary>
            <div className="border-t border-[var(--qv-border)] p-5">
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{client.configLabel}</h3>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-[var(--qv-muted)]">
                    {client.steps.map((step) => (
                      <li key={step} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--qv-blue)]" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 rounded-2xl border border-[var(--qv-border)] bg-[var(--qv-bg-muted)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Verify</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{client.verificationPrompt}</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[var(--qv-code)]">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Example config</p>
                    <McpCopyButton value={sampleConfig} label="Copy sample" />
                  </div>
                  <pre className="max-h-72 overflow-auto p-4 text-xs leading-6 text-slate-100"><code>{sampleConfig}</code></pre>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
