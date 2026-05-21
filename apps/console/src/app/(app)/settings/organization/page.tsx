"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Save, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
 Avatar,
 AvatarFallback,
 AvatarImage,
} from "@/src/components/ui/avatar";
import { Skeleton } from "@/src/components/ui/skeleton";
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
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/src/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/src/components/ui/select";
import { authClient } from "@/src/lib/auth-client";
import { generateSlug } from "@/src/utils/generateSlug";

const orgSchema = z.object({
 name: z.string().min(2),
 slug: z.string().min(2),
});

const inviteSchema = z.object({
 email: z.string().email(),
 role: z.enum(["member", "admin", "owner"]),
});

export default function OrganizationPage() {
 const { data: session } = authClient.useSession();
 const activeOrgId = session?.session?.activeOrganizationId ?? null;

 const [org, setOrg] = useState<Organization | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 const orgForm = useForm<z.infer<typeof orgSchema>>({
 resolver: zodResolver(orgSchema),
 defaultValues: { name: "", slug: "" },
 });

 async function refresh() {
 if (!activeOrgId) return;
 setLoading(true);
 try {
 const { data, error } = await authClient.organization.getFullOrganization({
 query: { organizationId: activeOrgId },
 });
 if (error) throw new Error(error.message);
 setOrg(data as Organization);
 orgForm.reset({
 name: (data as Organization).name,
 slug: (data as Organization).slug,
 });
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Could not load organization");
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 refresh();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [activeOrgId]);

 async function onSaveOrg(values: z.infer<typeof orgSchema>) {
 if (!activeOrgId) return;
 setSaving(true);
 try {
 const { error } = await authClient.organization.update({
 organizationId: activeOrgId,
 data: { name: values.name, slug: values.slug },
 });
 if (error) throw new Error(error.message);
 toast.success("Organization updated");
 await refresh();
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Could not update");
 } finally {
 setSaving(false);
 }
 }

 return (
 <div className="space-y-6">
 <section className="border bg-card p-6">
 <div className="mb-5 space-y-1">
 <h2 className="text-base font-semibold">Workspace details</h2>
 <p className="text-sm text-muted-foreground">
 The name and slug shown in the org switcher and URLs.
 </p>
 </div>
 {loading ? (
 <div className="space-y-4">
 <Skeleton className="h-10 w-full" />
 <Skeleton className="h-10 w-full" />
 </div>
 ) : (
 <Form {...orgForm}>
 <form
 onSubmit={orgForm.handleSubmit(onSaveOrg)}
 className="space-y-5"
 >
 <FormField
 control={orgForm.control}
 name="name"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Name</FormLabel>
 <FormControl>
 <Input
 {...field}
 onChange={(e) => {
 field.onChange(e);
 if (!orgForm.formState.dirtyFields.slug) {
 orgForm.setValue("slug", generateSlug(e.target.value));
 }
 }}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 <FormField
 control={orgForm.control}
 name="slug"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Slug</FormLabel>
 <FormControl>
 <Input {...field} />
 </FormControl>
 <FormDescription>
 Lowercase letters, numbers, and hyphens only.
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />
 <div className="flex justify-end">
 <Button
 type="submit"
 disabled={saving || !orgForm.formState.isDirty}
 >
 {saving ? (
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
 )}
 </section>

 <MembersSection
 orgId={activeOrgId}
 members={org?.members ?? []}
 loading={loading}
 refresh={refresh}
 />
 </div>
 );
}

function MembersSection({
 orgId,
 members,
 loading,
 refresh,
}: {
 orgId: string | null;
 members: Member[];
 loading: boolean;
 refresh: () => Promise<void>;
}) {
 const [inviteOpen, setInviteOpen] = useState(false);
 const [inviting, setInviting] = useState(false);

 const inviteForm = useForm<z.infer<typeof inviteSchema>>({
 resolver: zodResolver(inviteSchema),
 defaultValues: { email: "", role: "member" },
 });

 async function onInvite(values: z.infer<typeof inviteSchema>) {
 if (!orgId) return;
 setInviting(true);
 try {
 const { error } = await authClient.organization.inviteMember({
 email: values.email,
 role: values.role,
 organizationId: orgId,
 });
 if (error) throw new Error(error.message);
 toast.success(`Invite sent to ${values.email}`);
 setInviteOpen(false);
 inviteForm.reset();
 await refresh();
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Could not send invite");
 } finally {
 setInviting(false);
 }
 }

 async function onRemove(memberId: string) {
 if (!orgId) return;
 try {
 const { error } = await authClient.organization.removeMember({
 memberIdOrEmail: memberId,
 organizationId: orgId,
 });
 if (error) throw new Error(error.message);
 toast.success("Member removed");
 await refresh();
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Could not remove member");
 }
 }

 return (
 <section className="border bg-card p-6">
 <div className="mb-5 flex items-start justify-between gap-3">
 <div className="space-y-1">
 <h2 className="text-base font-semibold">Team members</h2>
 <p className="text-sm text-muted-foreground">
 Invite teammates and manage their roles.
 </p>
 </div>
 <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
 <DialogTrigger asChild>
 <Button>
 <UserPlus /> Invite member
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Invite a member</DialogTitle>
 <DialogDescription>
 They&apos;ll receive an email to join this organization.
 </DialogDescription>
 </DialogHeader>
 <Form {...inviteForm}>
 <form
 onSubmit={inviteForm.handleSubmit(onInvite)}
 className="space-y-5"
 >
 <FormField
 control={inviteForm.control}
 name="email"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Email</FormLabel>
 <FormControl>
 <Input type="email" placeholder="teammate@company.com" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 <FormField
 control={inviteForm.control}
 name="role"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Role</FormLabel>
 <Select
 value={field.value}
 onValueChange={field.onChange}
 >
 <FormControl>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="member">Member</SelectItem>
 <SelectItem value="admin">Admin</SelectItem>
 <SelectItem value="owner">Owner</SelectItem>
 </SelectContent>
 </Select>
 </FormItem>
 )}
 />
 <DialogFooter>
 <Button
 type="button"
 variant="outline"
 onClick={() => setInviteOpen(false)}
 disabled={inviting}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={inviting}>
 {inviting ? (
 <>
 <Loader2 className="animate-spin" /> Sending…
 </>
 ) : (
 <>
 <Mail /> Send invite
 </>
 )}
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 </div>

 {loading ? (
 <div className="space-y-2">
 {[...Array(3)].map((_, i) => (
 <Skeleton key={i} className="h-14 w-full" />
 ))}
 </div>
 ) : !members.length ? (
 <p className="py-6 text-center text-sm text-muted-foreground">
 No members yet.
 </p>
 ) : (
 <div className="divide-y">
 {members.map((m) => (
 <div
 key={m.id}
 className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
 >
 <Avatar className="size-9">
 {m.user.image ? (
 <AvatarImage src={m.user.image} alt={m.user.name} />
 ) : null}
 <AvatarFallback>
 {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-medium">
 {m.user.name || m.user.email}
 </p>
 <p className="truncate text-xs text-muted-foreground">
 {m.user.email}
 </p>
 </div>
 <Badge variant="secondary" className="uppercase tracking-wide">
 {m.role}
 </Badge>
 <Button
 variant="ghost"
 size="icon-sm"
 onClick={() => onRemove(m.id)}
 aria-label="Remove member"
 >
 <Trash2 />
 </Button>
 </div>
 ))}
 </div>
 )}
 </section>
 );
}
