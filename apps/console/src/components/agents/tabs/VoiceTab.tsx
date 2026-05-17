"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  useAgentConfig,
  useSaveAgentConfig,
} from "@/src/hooks/queries/agents";
import { VOICES } from "@/src/lib/data/voices";
import { mergeConfig } from "@/src/lib/agents/config-defaults";
import { cn } from "@/src/lib/utils";

const schema = z.object({
  voiceId: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function VoiceTab({ agentId }: { agentId: string }) {
  const { data: config, isLoading } = useAgentConfig(agentId);
  const save = useSaveAgentConfig(agentId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { voiceId: "aura-2-asteria-en" },
  });

  useEffect(() => {
    if (config) form.reset({ voiceId: config.voiceId });
  }, [config, form]);

  const selected = form.watch("voiceId");

  async function onSubmit(values: FormValues) {
    await save.mutateAsync(mergeConfig(config, values));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 space-y-1">
            <h2 className="text-base font-semibold">Voice</h2>
            <p className="text-sm text-muted-foreground">
              Pick a voice for the agent. Preview samples are coming soon.
            </p>
          </div>
          <FormField
            control={form.control}
            name="voiceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Voice</FormLabel>
                <FormControl>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {VOICES.map((v) => {
                      const isActive = selected === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => field.onChange(v.id)}
                          className={cn(
                            "relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/40",
                            isActive
                              ? "border-primary ring-2 ring-primary/30"
                              : ""
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">
                                {v.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {v.provider} · {v.accent}
                              </p>
                            </div>
                            {isActive ? (
                              <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="size-3.5" />
                              </div>
                            ) : null}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {v.styles.map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="text-[10px] font-medium uppercase tracking-wide"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={save.isPending || isLoading || !form.formState.isDirty}
          >
            {save.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save /> Save voice
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
