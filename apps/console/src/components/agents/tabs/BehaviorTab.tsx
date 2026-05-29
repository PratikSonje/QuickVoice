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
    useAgentConfig,
    useSaveAgentConfig,
} from "@/src/hooks/queries/agents";
import { mergeConfig } from "@/src/lib/agents/config-defaults";
import {
    DEFAULT_FIRST_MESSAGE,
    DEFAULT_SYSTEM_PROMPT,
} from "@/src/lib/agents/config-defaults";

const schema = z.object({
    systemPrompt: z.string().min(10, "Prompt must be at least 10 characters"),
    firstMessage: z.string().min(5, "First message must be at least 5 characters"),
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
        },
    });

    useEffect(() => {
        if (!config) return;
        form.reset({
            systemPrompt: config.systemPrompt,
            firstMessage: config.firstMessage,
        });
    }, [config, form]);

    async function onSubmit(values: FormValues) {
        await save.mutateAsync(mergeConfig(config, values));
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <section className="border bg-card p-6">
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
