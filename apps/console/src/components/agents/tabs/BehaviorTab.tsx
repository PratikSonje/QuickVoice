"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  useAgentConfig,
  useSaveAgentConfig,
} from "@/src/hooks/queries/agents";
import {
  COMMON_TIMEZONES,
  LANGUAGES,
  LLM_MODELS,
} from "@/src/lib/data/voices";
import { mergeConfig } from "@/src/lib/agents/config-defaults";
import {
  DEFAULT_FIRST_MESSAGE,
  DEFAULT_SYSTEM_PROMPT,
} from "@/src/lib/agents/config-defaults";

const schema = z.object({
  systemPrompt: z.string().min(10, "Prompt must be at least 10 characters"),
  firstMessage: z.string().min(5, "First message must be at least 5 characters"),
  agent_language: z.string().min(2),
  llmModel: z.string().min(2),
  timezone: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function BehaviorTab({ agentId }: { agentId: string }) {
  const { data: config, isLoading } = useAgentConfig(agentId);
  const save = useSaveAgentConfig(agentId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      firstMessage: DEFAULT_FIRST_MESSAGE,
      agent_language: "en",
      llmModel: "gpt-4o-mini",
      timezone: "UTC",
    },
  });

  useEffect(() => {
    if (!config) return;
    form.reset({
      systemPrompt: config.systemPrompt,
      firstMessage: config.firstMessage,
      agent_language: config.agent_language,
      llmModel: config.llmModel,
      timezone: config.timezone,
    });
  }, [config, form]);

  async function onSubmit(values: FormValues) {
    await save.mutateAsync(mergeConfig(config, values));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 space-y-1">
            <h2 className="text-base font-semibold">Persona</h2>
            <p className="text-sm text-muted-foreground">
              How the agent introduces itself and behaves on a call.
            </p>
          </div>
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="firstMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hi, thanks for calling…"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Spoken immediately when the call connects.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={10}
                      placeholder="Describe the agent's role, constraints, and tone."
                      className="resize-none font-mono text-xs leading-relaxed"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use `{`{variable}`}` to interpolate runtime values (e.g. caller name).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5 space-y-1">
            <h2 className="text-base font-semibold">Model & locale</h2>
            <p className="text-sm text-muted-foreground">
              Which LLM runs the conversation, and where the caller is.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="llmModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LLM</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LLM_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center justify-between gap-3 w-full">
                            <span>{m.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {m.provider}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agent_language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                <Save /> Save changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
