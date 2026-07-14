# Dynamic Variables From `rcm_v2` To QuickVoice

This document explains how to implement the dynamic variables feature in
QuickVoice using the working behavior in `rcm_v2/src/rcm/quickvoice` as the
reference.

It is written as an implementation guide, not a product spec. It maps the RCM
files to the current QuickVoice files, identifies what QuickVoice already has,
lists the missing pieces, and gives a practical build order.

## Goal

Dynamic variables let an agent prompt contain tokens such as:

```text
Hi {{patientName}}, this is calling about {{balanceDue}}.
```

At runtime those tokens should be replaced from one of these sources:

1. Per-call values from a quick outbound call.
2. Per-recipient values from a batch campaign CSV/XLSX row.
3. Values returned by the agent initiation webhook.
4. Agent-level placeholder values saved with the agent configuration.

The feature should work for:

- Agent configuration and preview placeholders.
- Quick outbound calls.
- Batch outbound campaigns.
- Initiation webhook response mapping.
- The AI LiveKit runtime that actually speaks the prompt.

## RCM Source Map

The dynamic variable behavior in RCM is spread across these files:

| Area | RCM file | What to reuse conceptually |
| --- | --- | --- |
| Agent schema | `rcm_v2/src/rcm/quickvoice/schemas/agents/agentConfigurationSchema.ts` | `variables` object shape and initiation webhook `dynamic_variables` map. |
| Prompt variable detection | `rcm_v2/src/rcm/quickvoice/app/agent/components/tabs/AgentTab.tsx` | Detect `{{name}}` tokens from first message and system prompt. |
| Placeholder modal | `rcm_v2/src/rcm/quickvoice/app/agent/components/ui/DynamicVariablesDialog.tsx` | Ask for default placeholder values. |
| Agent config save flow | `rcm_v2/src/rcm/quickvoice/components/forms/AgentConfigForm.tsx` | Save detected names plus placeholders into `configuration.variables`. |
| Quick call form | `rcm_v2/src/rcm/quickvoice/components/forms/QuickCallForm.tsx` | Load selected agent variables and collect per-call values into `optionalData`. |
| Quick call API schema | `rcm_v2/src/rcm/quickvoice/schemas/outbound-call/quickCallSchema.ts` | Accept `optionalData: Record<string, string>`. |
| Quick call backend | `rcm_v2/src/rcm/quickvoice/app/outbound/operations.ts` | Persist `optionalData` on the outbound call. |
| Campaign template | `rcm_v2/src/rcm/quickvoice/app/campaign/utils/parser.ts` | Build campaign CSV template with dynamic variable columns. |
| Campaign form | `rcm_v2/src/rcm/quickvoice/components/forms/AddCampaignForm.tsx` | Download a template based on selected agent variables. |
| Campaign backend | `rcm_v2/src/rcm/quickvoice/app/campaign/operations.ts` | Store unknown recipient columns as `optionalData`. |
| Runtime substitution | `rcm_v2/src/rcm/quickvoice/app/xml/telnyx.ts` | Merge webhook values, outbound values, and placeholders, then replace `{{var}}`. |
| Tests | `rcm_v2/src/rcm/quickvoice/__tests__/telnyxXml.test.ts`, `campaignTemplate.test.ts`, `outboundOperations.test.ts` | Precedence and persistence behavior to port into QuickVoice tests. |

## RCM Data Shape

RCM stores variable definitions on agent configuration:

```ts
variables: {
  firstMessage: string[];
  systemPrompt: string[];
  placeholders?: Record<string, string>;
}
```

Example:

```json
{
  "firstMessage": ["patientName"],
  "systemPrompt": ["patientName", "balanceDue"],
  "placeholders": {
    "patientName": "Jane Doe",
    "balanceDue": "125.40"
  }
}
```

RCM stores quick-call and campaign row values on `OutboundCall.optionalData`:

```json
{
  "patientName": "Avery Stone",
  "balanceDue": "125.40"
}
```

QuickVoice should preserve this concept, but for current QuickVoice batch calls
the per-recipient values already live under:

```json
{
  "dynamicVariables": {
    "city": "Mumbai",
    "other_dyn_variable": "renewal"
  }
}
```

To avoid breaking existing batch behavior, use this QuickVoice convention:

```ts
optionalData.dynamicVariables: Record<string, string>
```

Quick-call values should also be stored in `optionalData.dynamicVariables`.

## Current QuickVoice State

QuickVoice already has several pieces in place.

### Already Present

Database fields:

- `AgentConfiguration.variables Json?`
- `OutboundCall.optionalData Json?`

Relevant Prisma file:

- `QuickVoice/apps/server/prisma/schema.prisma`

Server agent schema already accepts:

```ts
variables: z.object({
  firstMessage: z.array(z.string()),
  systemPrompt: z.array(z.string()),
  placeholders: z.record(z.string(), z.string()).optional(),
}).optional()
```

Relevant file:

- `QuickVoice/apps/server/src/modules/agent/agent.schema.ts`

Console API types already include `ConfigureAgentInput.variables`.

Relevant file:

- `QuickVoice/apps/console/src/lib/api/resources/agents.ts`

Batch parser already treats unknown CSV/XLSX columns as dynamic variables.

Relevant file:

- `QuickVoice/apps/server/src/modules/outbound/outbound-batch-parser.ts`

Batch import already stores row variables in:

```ts
optionalData: {
  dynamicVariables: row.dynamicVariables
}
```

Relevant file:

- `QuickVoice/apps/server/src/modules/outbound/outbound-batch.service.ts`

Scheduled batch dispatch already sends dynamic variables into LiveKit metadata:

```ts
dynamic_variables: Object.keys(dynamicVariables).length > 0
  ? dynamicVariables
  : null
```

Relevant file:

- `QuickVoice/apps/server/src/modules/outbound/outbound-call.service.ts`

The AI worker already renders `dynamic_variables` for outbound/preview calls:

```py
updated["first_message"] = render_dynamic_variables(
    str(updated.get("first_message") or ""),
    dynamic_variables,
)
updated["system_prompt"] = render_dynamic_variables(
    str(updated.get("system_prompt") or ""),
    dynamic_variables,
)
```

Relevant file:

- `QuickVoice/apps/ai/handlers/worker_handler.py`

Tests already cover batch dynamic variables:

- `QuickVoice/apps/server/tests/outbound/outbound-batch-parser.test.ts`
- `QuickVoice/apps/server/tests/outbound/outbound-batch.service.test.ts`
- `QuickVoice/apps/server/tests/outbound/outbound-call.service.test.ts`
- `QuickVoice/apps/ai/tests/test_worker_helpers.py`

### Missing Or Incomplete

QuickVoice is missing these RCM behaviors:

1. The console agent editor does not detect and save variables from prompts.
2. The console does not show a dynamic variables placeholder dialog.
3. `mergeConfig` does not preserve `current.variables`, so config saves from
   different tabs may drop variables unless a tab explicitly sends them.
4. The behavior tab text says to use `{variable}`, but runtime expects
   `{{variable}}`.
5. The quick-call UI does not show variable inputs for the selected agent.
6. The quick-call API schema does not accept `dynamicVariables`.
7. `createQuickOutboundCall` does not persist quick-call dynamic variables or
   include them in LiveKit metadata.
8. Batch UI only copies a static header:
   `phone_number,language,voice_id,first_message,prompt,city,other_dyn_variable`.
   It does not generate a template from the selected agent's variables.
9. Webhooks UI does not expose initiation webhook `dynamic_variables` mapping.
10. AI runtime does not execute initiation webhook dynamic-variable resolution.
11. Placeholder fallback is not applied in the AI worker.
12. Preview sessions do not render placeholder values.

## Target Behavior

Use this precedence order when rendering `{{var}}`:

1. Quick-call or campaign row values.
2. Initiation webhook response values.
3. Agent placeholder values.
4. Leave the original `{{var}}` token unchanged.

RCM uses this same idea in `app/xml/telnyx.ts`:

```ts
const dynamicValues = {
  ...resolvedValues,
  ...callDynamicValues,
};
```

`callDynamicValues` wins because it is spread last.

QuickVoice should use the same precedence so that explicit per-call values
always win over webhook/default values.

## Token Syntax

Standardize on double braces:

```text
{{patientName}}
{{balanceDue}}
{{member_id}}
```

Do not use single braces:

```text
{patientName}
```

Recommended token regex:

```ts
const DYNAMIC_VARIABLE_RE = /\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g;
```

RCM uses:

```ts
/\{\{(\w+)\}\}/g
```

The stricter regex prevents names starting with digits while still supporting
camelCase and snake_case.

## Implementation Plan

### Phase 1: Add Shared Variable Utilities In Console

Create a console utility:

```text
QuickVoice/apps/console/src/lib/agents/dynamic-variables.ts
```

Suggested contents:

```ts
export type AgentVariables = {
  firstMessage: string[];
  systemPrompt: string[];
  placeholders?: Record<string, string>;
};

const DYNAMIC_VARIABLE_RE = /\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g;

export function extractDynamicVariableNames(text: string): string[] {
  const names = new Set<string>();
  for (const match of text.matchAll(DYNAMIC_VARIABLE_RE)) {
    if (match[1]) names.add(match[1]);
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export function uniqueVariableNames(variables: AgentVariables | null | undefined): string[] {
  return Array.from(
    new Set([
      ...(variables?.firstMessage ?? []),
      ...(variables?.systemPrompt ?? []),
    ])
  ).sort((a, b) => a.localeCompare(b));
}

export function variablePlaceholders(
  variables: unknown
): Record<string, string> {
  if (!variables || typeof variables !== "object" || Array.isArray(variables)) {
    return {};
  }
  const placeholders = (variables as AgentVariables).placeholders;
  if (!placeholders || typeof placeholders !== "object" || Array.isArray(placeholders)) {
    return {};
  }
  return placeholders;
}
```

Use this from:

- `BehaviorTab.tsx`
- `QuickCallForm.tsx`
- `BatchCallForm.tsx`
- future webhook variable mapping UI

### Phase 2: Preserve Variables In Config Defaults

Update:

```text
QuickVoice/apps/console/src/lib/agents/config-defaults.ts
```

`defaultConfig()` should include:

```ts
variables: {
  firstMessage: [],
  systemPrompt: [],
  placeholders: {},
},
```

`mergeConfig()` should preserve existing variables:

```ts
variables: current.variables as ConfigureAgentInput["variables"] ?? {
  firstMessage: [],
  systemPrompt: [],
  placeholders: {},
},
```

Without this, saving Voice/Webhooks/Advanced tabs can accidentally drop
variables because each tab calls `mergeConfig(config, patch)` and sends a full
configuration object.

### Phase 3: Detect Variables In Agent Behavior Tab

Update:

```text
QuickVoice/apps/console/src/components/agents/tabs/BehaviorTab.tsx
```

Behavior:

1. Watch `firstMessage` and `systemPrompt`.
2. Extract variable names with `extractDynamicVariableNames`.
3. Display badges/chips for detected variables.
4. Store the extracted lists in the submitted config.
5. Preserve existing placeholder values.
6. If any detected variable has no placeholder, open a dialog before saving.

RCM reference:

- `rcm_v2/src/rcm/quickvoice/app/agent/components/tabs/AgentTab.tsx`
- `rcm_v2/src/rcm/quickvoice/components/forms/AgentConfigForm.tsx`

Important fix:

Change the helper copy from:

```text
Use `{variable}` to interpolate runtime values
```

to:

```text
Use `{{variable}}` to interpolate runtime values
```

### Phase 4: Add Dynamic Variables Dialog

Create:

```text
QuickVoice/apps/console/src/components/agents/DynamicVariablesDialog.tsx
```

Port the RCM dialog concept from:

```text
rcm_v2/src/rcm/quickvoice/app/agent/components/ui/DynamicVariablesDialog.tsx
```

QuickVoice-specific behavior:

- Show all unique variables from first message and system prompt.
- Input values update local `placeholderValues`.
- The save button writes:

```ts
variables: {
  firstMessage: firstMessageVars,
  systemPrompt: systemPromptVars,
  placeholders: placeholderValues,
}
```

Suggested UX copy:

```text
These values are used for preview, local testing, and as fallbacks when a call
does not provide a value.
```

### Phase 5: Support Dynamic Variables In Quick Calls

#### Console Model

Update:

```text
QuickVoice/apps/console/src/models/outbound/quickCall.ts
```

Add:

```ts
dynamicVariables: z.record(z.string(), z.string()).optional(),
```

#### Console API Type

The API uses `QuickCallInput`, so updating the zod model is enough for the
console call type. Confirm `outboundApi.quickCall()` accepts the expanded type:

```text
QuickVoice/apps/console/src/lib/api/resources/outbound.ts
```

#### Quick Call UI

Update:

```text
QuickVoice/apps/console/src/components/outbound/QuickCallForm.tsx
```

Add:

1. Load selected agent config:

```ts
const { data: agentConfig } = useAgentConfig(agentId);
```

2. Compute variables:

```ts
const dynamicVariableNames = uniqueVariableNames(
  agentConfig?.variables as AgentVariables | null
);
```

3. Render one input for each variable:

```tsx
{dynamicVariableNames.map((name) => (
  <div key={name} className="grid gap-2">
    <Label className="font-mono">{`{{${name}}}`}</Label>
    <Input
      value={dynamicVariables[name] ?? ""}
      placeholder={placeholders[name] ?? `Value for ${name}`}
      onChange={(event) =>
        setDynamicVariables((prev) => ({
          ...prev,
          [name]: event.target.value,
        }))
      }
    />
  </div>
))}
```

4. Submit:

```ts
dynamicVariables: compactStringRecord(dynamicVariables),
```

Do not use RCM's healthcare-specific fields (`patientId`, `appointmentId`,
`claimId`) unless QuickVoice explicitly wants those as general product fields.
For the open-source QuickVoice app, keep it generic.

#### Server Schema

Update:

```text
QuickVoice/apps/server/src/modules/outbound/outbound-call.schema.ts
```

Add:

```ts
dynamicVariables: z.record(z.string(), z.string()).optional(),
```

#### Server Service

Update:

```text
QuickVoice/apps/server/src/modules/outbound/outbound-call.service.ts
```

In `createQuickOutboundCall`, persist dynamic variables:

```ts
optionalData: {
  username: args.username ?? null,
  provider,
  sid,
  dynamicVariables: sanitizeDynamicVariables(args.dynamicVariables),
},
```

In `buildOutboundMetadata`, include:

```ts
dynamic_variables:
  args.dynamicVariables && Object.keys(args.dynamicVariables).length > 0
    ? args.dynamicVariables
    : null,
```

Also make sure `markInProgress` preserves `dynamicVariables` when it writes
LiveKit participant/dispatch data back to `optionalData`.

The current code overwrites `optionalData` with:

```ts
{
  username,
  provider,
  sid,
  livekitParticipant,
  agentDispatch,
}
```

Change it to include `dynamicVariables`.

#### Tests

Add/update:

```text
QuickVoice/apps/server/tests/outbound/outbound-call.service.test.ts
```

Test expectations:

- `createQuickCall` receives `optionalData.dynamicVariables`.
- LiveKit dispatch metadata contains `dynamic_variables`.
- SIP participant metadata contains the same `dynamic_variables`.
- AI worker receives and renders those variables.

### Phase 6: Improve Batch Campaign Template Generation

QuickVoice already supports dynamic variables in the server parser, but the
console template is static. Improve the UI to match RCM.

Current QuickVoice header:

```ts
export const BATCH_TEMPLATE_HEADER =
  "phone_number,language,voice_id,first_message,prompt,city,other_dyn_variable";
```

Relevant file:

```text
QuickVoice/apps/console/src/models/outbound/campaign.ts
```

Replace the static-only model with helpers:

```ts
export const BATCH_BASE_HEADERS = [
  "phone_number",
  "language",
  "voice_id",
  "first_message",
  "prompt",
] as const;

export function buildBatchTemplateHeader(dynamicVariables: string[] = []) {
  return [
    ...BATCH_BASE_HEADERS,
    ...Array.from(new Set(dynamicVariables)).sort((a, b) => a.localeCompare(b)),
  ].join(",");
}
```

Then update:

```text
QuickVoice/apps/console/src/components/outbound/BatchCallForm.tsx
```

Behavior:

1. Load selected agent config.
2. Extract variable names from `config.variables`.
3. Use them when copying the header.
4. Prefer a downloaded CSV template, not just copied text.
5. Use placeholder values in sample rows, like RCM does.

RCM reference:

- `rcm_v2/src/rcm/quickvoice/app/campaign/utils/parser.ts`
- `rcm_v2/src/rcm/quickvoice/components/forms/AddCampaignForm.tsx`

QuickVoice must keep snake_case columns because the server expects
`phone_number`. RCM uses `phoneNumber`, but QuickVoice's parser normalizes only
case/spaces, not camelCase to snake_case.

Keep these reserved columns:

```ts
phone_number
language
voice_id
first_message
prompt
system_prompt
```

Everything else becomes `dynamicVariables`.

### Phase 7: Add Initiation Webhook Variable Mapping UI

QuickVoice server schema already allows:

```ts
initiation_webhook.dynamic_variables?: Record<string, string>
```

Relevant files:

- `QuickVoice/apps/server/src/modules/agent/agent.schema.ts`
- `QuickVoice/apps/console/src/lib/api/resources/agents.ts`

But the console currently only saves:

```ts
{ webhook_url, method }
```

Relevant file:

```text
QuickVoice/apps/console/src/components/agents/tabs/WebhooksTab.tsx
```

Add UI for initiation webhook response mapping:

```text
Variable          JSON path
{{patientName}}   patient.name
{{balanceDue}}    account.balance_due
```

Only show rows for detected agent variables. Save:

```ts
initiation_webhook: {
  webhook_url,
  method,
  dynamic_variables: {
    patientName: "patient.name",
    balanceDue: "account.balance_due",
  },
}
```

Also preserve existing `headers` and `body` if they exist, even if the first
UI version does not edit them. The current tab rebuilds the webhook object and
can drop fields.

RCM reference:

- `rcm_v2/src/rcm/quickvoice/schemas/agents/agentConfigurationSchema.ts`
- `rcm_v2/src/rcm/quickvoice/app/xml/telnyx.ts`

### Phase 8: Execute Initiation Webhook In AI Runtime

RCM executes the initiation webhook before building Telnyx XML. QuickVoice
does not use Telnyx XML for this path; it loads runtime config inside the AI
worker. Therefore QuickVoice should execute initiation webhook logic in the AI
service after config load and before `AgentSession.start()`.

Recommended new file:

```text
QuickVoice/apps/ai/handlers/initiation_webhook_handler.py
```

Responsibilities:

1. Read `config["initiation_webhook"]`.
2. Build request from `webhook_url`, `method`, `headers`, and `body`.
3. Execute GET/POST with a short timeout.
4. Read response JSON.
5. For every configured variable, resolve the JSON path.
6. Fallback to placeholders if path is missing or request fails.
7. Return `Record[str, str]`.

Suggested Python helper behavior:

```py
async def resolve_initiation_dynamic_variables(config: dict, call_context: dict) -> dict[str, str]:
    webhook = config.get("initiation_webhook")
    variables = config.get("variables") or {}
    placeholders = variables.get("placeholders") or {}
    wanted = set((variables.get("firstMessage") or []) + (variables.get("systemPrompt") or []))

    if not webhook or not webhook.get("webhook_url"):
        return dict(placeholders)

    # call webhook, resolve paths, fallback to placeholders
```

The Python runtime receives already-resolved secret values because the server
uses:

```ts
resolveRuntimeConfigSecrets()
```

in:

```text
QuickVoice/apps/server/src/modules/agent/agent.service.ts
```

Security notes:

- URL safety is enforced at save time in the server with `assertSafeRemoteUrl`.
- Keep a request timeout around 5 seconds.
- Treat non-2xx as failure and fallback to placeholders.
- Do not log webhook response bodies.

### Phase 9: Refactor Runtime Rendering Precedence

Current QuickVoice rendering happens inside:

```py
apply_metadata_overrides(config, metadata)
```

Relevant file:

```text
QuickVoice/apps/ai/handlers/worker_handler.py
```

That works for batch metadata but not for webhook values plus placeholders.
Refactor to separate "apply override fields" from "render variables".

Recommended shape:

```py
def apply_metadata_overrides(config: dict, metadata: dict[str, Any]) -> dict[str, Any]:
    # only override first_message/system_prompt/language/voice, do not render
```

Add:

```py
def merge_runtime_dynamic_variables(
    config: dict,
    webhook_values: dict[str, Any],
    metadata: dict[str, Any],
) -> dict[str, Any]:
    placeholders = {}
    variables = config.get("variables")
    if isinstance(variables, dict) and isinstance(variables.get("placeholders"), dict):
        placeholders = variables["placeholders"]

    metadata_vars = _pick(metadata, "dynamic_variables", "dynamicVariables")
    if not isinstance(metadata_vars, dict):
        metadata_vars = {}

    return {
        **placeholders,
        **webhook_values,
        **metadata_vars,
    }
```

Then render:

```py
dynamic_values = merge_runtime_dynamic_variables(config, webhook_values, metadata)
config["first_message"] = render_dynamic_variables(config["first_message"], dynamic_values)
config["system_prompt"] = render_dynamic_variables(config["system_prompt"], dynamic_values)
```

Use this order:

1. Load config.
2. Apply outbound/preview prompt, language, and voice overrides.
3. Resolve initiation webhook values.
4. Merge placeholders + webhook + metadata dynamic variables.
5. Render first message and system prompt.
6. Start the LiveKit session.

That gives RCM-equivalent precedence:

```text
metadata dynamic variables > webhook dynamic variables > placeholders
```

### Phase 10: Render Placeholder Values In Preview

QuickVoice preview currently sends first message and system prompt as metadata:

```text
QuickVoice/apps/server/src/modules/agent/agent.service.ts
```

Add agent `variables` to `PreviewConfigSource` and include:

```ts
dynamic_variables: configuration.variables?.placeholders ?? undefined
```

inside preview metadata.

Alternative: let the AI worker render placeholders from config after loading
the agent config. This is cleaner if Phase 9 already adds placeholder rendering.

Expected preview behavior:

- If the prompt says `Hi {{patientName}}`.
- And placeholder is `Jane Doe`.
- Preview says `Hi Jane Doe`.

### Phase 11: Update Batch Campaign UI To Use Agent Variables

QuickVoice server-side batch dynamic variables already work. The UI should make
them discoverable.

In:

```text
QuickVoice/apps/console/src/components/outbound/BatchCallForm.tsx
```

Add selected agent config loading:

```ts
const { data: agentConfig } = useAgentConfig(agentId);
const variableNames = uniqueVariableNames(agentConfig?.variables as AgentVariables | null);
const placeholders = variablePlaceholders(agentConfig?.variables);
```

Then:

- Show detected variables near the recipient file section.
- Generate copy/download template from `variableNames`.
- Use placeholder values in sample rows.

Example generated header:

```text
phone_number,language,voice_id,first_message,prompt,balanceDue,patientName
```

Example row:

```text
+15551234567,en-US,,Hi {{patientName}},Collect {{balanceDue}},125.40,Jane Doe
```

### Phase 12: Add Tests

Add these tests so the feature is safe to refactor.

#### Console Utility Tests

New file:

```text
QuickVoice/apps/console/tests/dynamic-variables.test.mjs
```

Cover:

- Extracts `patientName` from `Hi {{patientName}}`.
- Deduplicates variables across first message and system prompt.
- Supports snake_case.
- Ignores single-brace `{patientName}`.

#### Console Batch Template Tests

Cover:

- Header includes selected agent variables.
- Placeholder values appear in sample rows.
- Uses QuickVoice snake_case reserved columns.

#### Server Quick Call Tests

Update:

```text
QuickVoice/apps/server/tests/outbound/outbound-call.service.test.ts
```

Cover:

- `createQuickOutboundCall()` stores `optionalData.dynamicVariables`.
- Dispatch metadata includes `dynamic_variables`.
- `markInProgress()` preserves dynamic variable data.

#### AI Worker Tests

Update:

```text
QuickVoice/apps/ai/tests/test_worker_helpers.py
```

Cover:

- Renders placeholders when no metadata values are present.
- Metadata values override placeholders.
- Webhook values override placeholders.
- Metadata values override webhook values.
- Missing values leave `{{var}}` unchanged.

Add a new test file for initiation webhook if split into a separate handler:

```text
QuickVoice/apps/ai/tests/test_initiation_webhook_handler.py
```

Cover:

- Resolves `patient.name` path.
- Falls back to placeholder on missing path.
- Falls back to placeholder on request error.
- Does not include unresolved variables not referenced by the prompt.

## Suggested Build Order

Implement in this order to keep the app working after each step:

1. Add console variable utilities and tests.
2. Update `mergeConfig()` to preserve variables.
3. Update `BehaviorTab` to detect variables and save placeholders.
4. Fix the UI copy to use `{{variable}}`.
5. Add quick-call dynamic variable fields in console.
6. Add quick-call API schema and server metadata support.
7. Add quick-call service tests.
8. Improve batch template generation in console.
9. Add initiation webhook mapping UI.
10. Add AI initiation webhook resolver.
11. Refactor AI runtime rendering to support placeholders/webhook/metadata precedence.
12. Add preview placeholder rendering.
13. Add end-to-end smoke test using a prompt with `{{patientName}}`.

## Compatibility Notes

### No Prisma Migration Required

The required JSON fields already exist:

- `AgentConfiguration.variables`
- `OutboundCall.optionalData`

Do not add new columns unless the product wants typed query/filter support.

### Keep QuickVoice Column Names

RCM campaign files use `phoneNumber`. QuickVoice currently expects
`phone_number`.

Keep QuickVoice's snake_case batch format:

```text
phone_number,language,voice_id,first_message,prompt
```

### Keep Dynamic Values Generic

RCM has healthcare/RCM-specific fields:

- `patientId`
- `appointmentId`
- `claimId`

QuickVoice should avoid adding those as first-class fields unless the product
is intentionally becoming RCM-specific. Use dynamic variables instead.

### Watch For Field Loss On Config Saves

Any tab that calls `mergeConfig(config, patch)` can drop fields not included in
`mergeConfig`. Add `variables` there before adding UI, otherwise the first
save from another tab can erase variable configuration.

### Current Runtime Token Renderer Is Simple

QuickVoice currently does:

```py
rendered = rendered.replace("{{" + str(key) + "}}", str(value))
```

That is acceptable for exact replacement but does not enforce token naming or
fallback behavior. For parity with RCM and safer behavior, use a regex-based
renderer:

```py
VARIABLE_RE = re.compile(r"\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}")

def render_dynamic_variables(template: str, values: dict[str, Any]) -> str:
    def replace(match):
        key = match.group(1)
        if key in values and values[key] is not None:
            return str(values[key])
        return match.group(0)
    return VARIABLE_RE.sub(replace, template or "")
```

## Acceptance Criteria

The feature is complete when these are true:

- Agent behavior editor detects `{{variable}}` from first message and system
  prompt.
- Agent config stores:

```json
{
  "firstMessage": ["patientName"],
  "systemPrompt": ["balanceDue", "patientName"],
  "placeholders": {
    "patientName": "Jane Doe",
    "balanceDue": "125.40"
  }
}
```

- Preview renders placeholder values.
- Quick call form shows one input per detected variable.
- Quick call request sends:

```json
{
  "dynamicVariables": {
    "patientName": "Avery Stone"
  }
}
```

- Quick call dispatch metadata includes:

```json
{
  "dynamic_variables": {
    "patientName": "Avery Stone"
  }
}
```

- Batch campaign template includes selected agent dynamic variable columns.
- Batch uploaded rows still map unknown columns to `optionalData.dynamicVariables`.
- Initiation webhook can map response JSON paths to variables.
- Runtime precedence is:

```text
quick/campaign values > initiation webhook values > placeholders > original token
```

- Tests cover extraction, quick-call persistence, batch template generation,
  batch dispatch, AI rendering, and webhook fallback.

## Minimal Example Walkthrough

1. User configures an agent:

```text
First message:
Hi {{patientName}}, this is QuickVoice.

System prompt:
You are calling about balance {{balanceDue}}.
```

2. Console detects:

```json
{
  "firstMessage": ["patientName"],
  "systemPrompt": ["balanceDue"],
  "placeholders": {
    "patientName": "Jane Doe",
    "balanceDue": "125.40"
  }
}
```

3. Quick call form shows:

```text
{{patientName}} [________]
{{balanceDue}}  [________]
```

4. User enters:

```json
{
  "patientName": "Avery Stone",
  "balanceDue": "210.55"
}
```

5. Server stores:

```json
{
  "username": null,
  "provider": "TWILIO",
  "sid": "carrier-sid",
  "dynamicVariables": {
    "patientName": "Avery Stone",
    "balanceDue": "210.55"
  }
}
```

6. LiveKit metadata contains:

```json
{
  "direction": "outbound",
  "dynamic_variables": {
    "patientName": "Avery Stone",
    "balanceDue": "210.55"
  }
}
```

7. AI worker renders:

```text
Hi Avery Stone, this is QuickVoice.
You are calling about balance 210.55.
```

## Summary

QuickVoice already has the database fields, server-side batch parser, scheduled
batch dispatch metadata, and AI worker rendering foundation. The main work to
port from RCM is:

- Agent editor detection and placeholder UX.
- Config preservation across tabs.
- Quick-call UI/API/service support for `dynamicVariables`.
- Batch template generation from selected agent variables.
- Initiation webhook variable mapping and runtime execution.
- Runtime fallback/precedence handling.

The implementation should reuse RCM's behavior, but adapt naming to the
existing QuickVoice architecture: use `variables` on agent config,
`optionalData.dynamicVariables` on outbound calls, and `dynamic_variables` in
LiveKit metadata.
