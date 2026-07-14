"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
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
import { mergeConfig } from "@/src/lib/agents/config-defaults";

const webhookVariableNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

const schema = z.object({
    initiation_enabled: z.boolean(),
    initiation_url: z.string().url().or(z.literal("")),
    initiation_method: z.enum(["GET", "POST"]),
    post_enabled: z.boolean(),
    post_url: z.string().url().or(z.literal("")),
    post_transcript: z.boolean(),
    post_audio: z.boolean(),
}).superRefine((values, ctx) => {
    if (values.initiation_enabled && !values.initiation_url.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Initiation webhook URL is required when enabled",
            path: ["initiation_url"],
        });
    }
    if (values.post_enabled && !values.post_url.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Post-call webhook URL is required when enabled",
            path: ["post_url"],
        });
    }
});

type FormValues = z.infer<typeof schema>;
type WebhookVariableRow = {
    id: string;
    key: string;
    value: string;
};

function createVariableRow(key = "", value = ""): WebhookVariableRow {
    return {
        id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()) + "-" + String(Math.random()),
        key,
        value,
    };
}

function rowsFromRecord(value: unknown): WebhookVariableRow[] {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];

    return Object.entries(value as Record<string, unknown>).map(([key, entry]) =>
        createVariableRow(key, typeof entry === "string" ? entry : String(entry ?? ""))
    );
}

function recordFromRows(rows: WebhookVariableRow[]) {
    const record: Record<string, string> = {};
    for (const row of rows) {
        const key = row.key.trim();
        const value = row.value.trim();
        if (!key && !value) continue;
        if (!key || !value) continue;
        record[key] = value;
    }
    return record;
}

function validateRows(rows: WebhookVariableRow[]) {
    const seen = new Set<string>();
    for (const row of rows) {
        const key = row.key.trim();
        const value = row.value.trim();
        if (!key && !value) continue;
        if (!key || !value) return "Complete or remove empty variable rows.";
        if (!webhookVariableNamePattern.test(key)) {
            return "Variable names must start with a letter or underscore and use only letters, numbers, and underscores.";
        }
        if (seen.has(key)) return "Variable " + key + " is duplicated.";
        seen.add(key);
    }
    return null;
}

function recordsEqual(a: Record<string, string>, b: Record<string, string>) {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key, index) => key === bKeys[index] && a[key] === b[key]);
}

export function WebhooksTab({ agentId }: { agentId: string }) {
    const { data: config, isLoading } = useAgentConfig(agentId);
    const save = useSaveAgentConfig(agentId);
    const [initiationVariableRows, setInitiationVariableRows] = useState<WebhookVariableRow[]>([]);
    const [webhookError, setWebhookError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            initiation_enabled: false,
            initiation_url: "",
            initiation_method: "POST",
            post_enabled: false,
            post_url: "",
            post_transcript: true,
            post_audio: false,
        },
    });

    useEffect(() => {
        if (!config) return;
        const init = config.initiation_webhook;
        const post = config.post_call_webhook;
        form.reset({
            initiation_enabled: !!init,
            initiation_url: init?.webhook_url ?? "",
            initiation_method: (init?.method as "GET" | "POST") ?? "POST",
            post_enabled: !!post,
            post_url: post?.webhook_url ?? "",
            post_transcript: post?.transcript ?? true,
            post_audio: post?.audio_url ?? false,
        });
        setInitiationVariableRows(rowsFromRecord(init?.dynamic_variables));
        setWebhookError(null);
    }, [config, form]);

    const savedInitiationVariables = useMemo(
        () => recordFromRows(rowsFromRecord(config?.initiation_webhook?.dynamic_variables)),
        [config?.initiation_webhook?.dynamic_variables]
    );
    const currentInitiationVariables = useMemo(
        () => recordFromRows(initiationVariableRows),
        [initiationVariableRows]
    );
    const initiationVariablesChanged = !recordsEqual(
        currentInitiationVariables,
        savedInitiationVariables
    );

    async function onSubmit(v: FormValues) {
        setWebhookError(null);
        const rowError = validateRows(initiationVariableRows);
        if (rowError) {
            setWebhookError(rowError);
            return;
        }

        const dynamic_variables = recordFromRows(initiationVariableRows);
        const initiation_webhook = v.initiation_enabled
            ? {
                webhook_url: v.initiation_url,
                method: v.initiation_method,
                ...(Object.keys(dynamic_variables).length > 0 ? { dynamic_variables } : {}),
            }
            : null;
        const post_call_webhook = v.post_enabled
            ? {
                webhook_url: v.post_url,
                method: "POST" as const,
                transcript: v.post_transcript,
                audio_url: v.post_audio,
            }
            : null;
        await save.mutateAsync(
            mergeConfig(config, { initiation_webhook, post_call_webhook })
        );
        form.reset(v);
        setInitiationVariableRows(rowsFromRecord(dynamic_variables));
    }

    const initiationOn = useWatch({
        control: form.control,
        name: "initiation_enabled",
    });
    const postOn = useWatch({
        control: form.control,
        name: "post_enabled",
    });
    const canSave = form.formState.isDirty || initiationVariablesChanged;

    function addVariableRow() {
        setInitiationVariableRows((rows) => [...rows, createVariableRow()]);
    }

    function updateVariableRow(id: string, patch: Partial<WebhookVariableRow>) {
        setInitiationVariableRows((rows) =>
            rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
        );
    }

    function removeVariableRow(id: string) {
        setInitiationVariableRows((rows) => rows.filter((row) => row.id !== id));
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <section className="border bg-card p-6">
                    <div className="mb-5 flex items-start justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold">Initiation webhook</h2>
                            <p className="text-sm text-muted-foreground">
                                Fetched at call start to provide caller context.
                            </p>
                        </div>
                        <FormField
                            control={form.control}
                            name="initiation_enabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3">
                                    <Label className="text-xs">Enabled</Label>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                        <FormField
                            control={form.control}
                            name="initiation_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://api.yourapp.com/webhooks/initiation"
                                            disabled={!initiationOn}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="initiation_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Method</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={!initiationOn}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="GET">GET</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="mt-5 border border-dashed bg-muted/20 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Static variables</p>
                                <p className="text-sm text-muted-foreground">
                                    Values saved here can be returned as initiation context.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addVariableRow}
                                disabled={!initiationOn}
                            >
                                <Plus /> Add variable
                            </Button>
                        </div>

                        {initiationVariableRows.length > 0 ? (
                            <div className="mt-4 space-y-3">
                                {initiationVariableRows.map((row) => (
                                    <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                        <Input
                                            aria-label="Variable name"
                                            placeholder="customer_name"
                                            value={row.key}
                                            disabled={!initiationOn}
                                            onChange={(event) =>
                                                updateVariableRow(row.id, { key: event.target.value })
                                            }
                                        />
                                        <Input
                                            aria-label="Variable value"
                                            placeholder="Saved value"
                                            value={row.value}
                                            disabled={!initiationOn}
                                            onChange={(event) =>
                                                updateVariableRow(row.id, { value: event.target.value })
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={!initiationOn}
                                            onClick={() => removeVariableRow(row.id)}
                                        >
                                            <Trash2 />
                                            <span className="sr-only">Remove variable</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-muted-foreground">No static variables.</p>
                        )}
                        {webhookError ? (
                            <p className="mt-3 text-sm text-destructive">{webhookError}</p>
                        ) : null}
                    </div>
                </section>

                <section className="border bg-card p-6">
                    <div className="mb-5 flex items-start justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold">Post-call webhook</h2>
                            <p className="text-sm text-muted-foreground">
                                Called after the call completes, with transcripts and optional audio recording URL.
                            </p>
                        </div>
                        <FormField
                            control={form.control}
                            name="post_enabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3">
                                    <Label className="text-xs">Enabled</Label>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-5">
                        <FormField
                            control={form.control}
                            name="post_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://api.yourapp.com/webhooks/post-call"
                                            disabled={!postOn}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="post_transcript"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between border p-4">
                                        <div className="space-y-0.5">
                                            <Label>Include transcript</Label>
                                            <FormDescription>Full transcript in payload.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={!postOn}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="post_audio"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between border p-4">
                                        <div className="space-y-0.5">
                                            <Label>Include audio URL</Label>
                                            <FormDescription>Signed URL to the recording.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={!postOn}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="submit"
                        disabled={save.isPending || isLoading || !canSave}
                    >
                        {save.isPending ? (
                            <>
                                <Loader2 className="animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save /> Save webhooks
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
