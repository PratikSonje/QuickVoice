"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Save, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/src/components/ui/dialog";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/src/components/ui/form";
import { EmptyState } from "@/src/components/common/EmptyState";
import { PermissionMatrix } from "@/src/components/settings/PermissionMatrix";
import { authClient } from "@/src/lib/auth-client";
import type { Permissions, ResourceId } from "@/src/lib/permissions";

const schema = z.object({
 role: z
 .string()
 .min(2)
 .regex(/^[a-z][a-z0-9_-]*$/, "Lowercase letters, digits, dashes"),
});

interface Role {
 id: string;
 role: string;
 permission: Permissions;
}

export default function RolesPage() {
 const { data: session } = authClient.useSession();
 const orgId = session?.session?.activeOrganizationId ?? null;

 const [createOpen, setCreateOpen] = useState(false);
 const [permissions, setPermissions] = useState<Permissions>({});
 const [saving, setSaving] = useState(false);

 const form = useForm<z.infer<typeof schema>>({
 resolver: zodResolver(schema),
 defaultValues: { role: "" },
 });

 // Better Auth dynamicAccessControl role CRUD varies by version. This page
 // provides a UI shell; wiring to the exact client methods is a follow-up.
 const [roles] = useState<Role[]>([]);
 const [loading] = useState(false);

 async function onCreate(values: z.infer<typeof schema>) {
 if (!orgId) return;
 setSaving(true);
 try {
 const ac = authClient.organization as unknown as {
 createRole?: (input: {
 organizationId: string;
 role: string;
 permission: Record<string, string[]>;
 }) => Promise<{ error?: { message?: string } }>;
 };
 if (!ac.createRole) {
 toast.error(
 "Custom role creation requires a newer version of Better Auth client."
 );
 return;
 }
 const { error } = await ac.createRole({
 organizationId: orgId,
 role: values.role,
 permission: permissions as Record<ResourceId, string[]>,
 });
 if (error) throw new Error(error.message);
 toast.success(`Role "${values.role}" created`);
 setCreateOpen(false);
 form.reset();
 setPermissions({});
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Could not create role");
 } finally {
 setSaving(false);
 }
 }

 return (
 <div className="space-y-6">
 <section className="border bg-card p-6">
 <div className="mb-5 flex items-start justify-between gap-3">
 <div className="space-y-1">
 <h2 className="text-base font-semibold">Custom roles</h2>
 <p className="text-sm text-muted-foreground">
 Built-in roles (owner, admin, member) always exist. Add custom
 roles for fine-grained access.
 </p>
 </div>
 <Dialog open={createOpen} onOpenChange={setCreateOpen}>
 <DialogTrigger asChild>
 <Button>
 <Plus /> New role
 </Button>
 </DialogTrigger>
 <DialogContent className="max-w-2xl">
 <DialogHeader>
 <DialogTitle>Create custom role</DialogTitle>
 <DialogDescription>
 Pick the permissions this role should have. Role names are
 lowercase and can include dashes.
 </DialogDescription>
 </DialogHeader>
 <Form {...form}>
 <form
 onSubmit={form.handleSubmit(onCreate)}
 className="space-y-5"
 >
 <FormField
 control={form.control}
 name="role"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Role name</FormLabel>
 <FormControl>
 <Input placeholder="e.g. auditor" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 <div>
 <FormLabel>Permissions</FormLabel>
 <div className="mt-2">
 <PermissionMatrix
 value={permissions}
 onChange={setPermissions}
 />
 </div>
 </div>
 <DialogFooter>
 <Button
 type="button"
 variant="outline"
 onClick={() => setCreateOpen(false)}
 disabled={saving}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={saving}>
 {saving ? (
 <>
 <Loader2 className="animate-spin" /> Creating…
 </>
 ) : (
 <>
 <Save /> Create role
 </>
 )}
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 </div>

 <div className="mb-6 space-y-3">
 {["owner", "admin", "member"].map((r) => (
 <div
 key={r}
 className="flex items-center justify-between border bg-muted/20 p-3"
 >
 <div className="flex items-center gap-3">
 <div className="flex size-8 items-center justify-center border bg-background">
 <Shield className="size-4 text-primary" />
 </div>
 <div>
 <p className="text-sm font-medium capitalize">{r}</p>
 <p className="text-xs text-muted-foreground">Built-in</p>
 </div>
 </div>
 <Badge variant="secondary">System</Badge>
 </div>
 ))}
 </div>

 {loading ? null : !roles.length ? (
 <EmptyState
 icon={Shield}
 title="No custom roles yet"
 description="Built-in roles (owner, admin, member) are always available. Create a custom role for finer-grained access."
 className="border-0"
 />
 ) : (
 <div className="divide-y">
 {roles.map((r) => (
 <div key={r.id} className="flex items-center justify-between gap-3 py-3">
 <div>
 <p className="text-sm font-medium">{r.role}</p>
 <p className="text-xs text-muted-foreground">
 {Object.keys(r.permission).length} resources
 </p>
 </div>
 <Button variant="ghost" size="icon-sm" aria-label="Delete role">
 <Trash2 />
 </Button>
 </div>
 ))}
 </div>
 )}
 </section>
 </div>
 );
}
