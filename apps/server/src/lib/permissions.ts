import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, defaultRoles } from "better-auth/plugins/organization/access";

const statement = {
    ...defaultStatements,
    agent: ["create", "read", "update", "delete"],
    agentConfiguration: ["create", "read", "update", "delete"],
    phoneNumber: ["create", "read", "update", "delete"],
    knowledgeSource: ["create", "read", "delete"],
    callLogs: ["read", "delete"],
    outboundCalls: ["create", "read", "delete"],
    campaigns: ["create", "read", "delete"],
    tools: ["create", "read", "update", "delete"],
    secrets: ["create", "read", "delete"],

} as const;

const ac = createAccessControl(statement);



export { ac,defaultRoles as roles };