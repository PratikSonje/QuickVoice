import { ChevronDown } from "lucide-react";
import { mcpFaq } from "@/data/mcp-faq";
import { McpSectionHeading } from "./mcp-section-heading";

export function McpFaq() {
  return (
    <section id="faq" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <McpSectionHeading
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Answers for teams connecting QuickVoice MCP to their AI development and operations workflows."
      />
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {mcpFaq.map((item) => (
          <details key={item.question} className="group rounded-2xl border border-[var(--qv-border)] bg-white shadow-sm open:border-[var(--qv-blue)]/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--qv-blue)]/20">
              {item.question}
              <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-slate-400 transition group-open:rotate-180 group-open:text-[var(--qv-blue)]" />
            </summary>
            <p className="border-t border-[var(--qv-border)] px-5 py-4 text-sm leading-7 text-[var(--qv-muted)]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
