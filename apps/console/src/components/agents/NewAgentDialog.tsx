"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/src/components/ui/form";
import { useCreateAgent } from "@/src/hooks/queries/agents";

const schema = z.object({
 name: z.string().min(2, "Agent name must be at least 2 characters"),
 isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function NewAgentDialog() {
 const [open, setOpen] = useState(false);
 const router = useRouter();
 const createAgent = useCreateAgent();

 const form = useForm<FormValues>({
 resolver: zodResolver(schema),
 defaultValues: { name: "", isActive: true },
 });

 async function onSubmit(values: FormValues) {
 const agent = await createAgent.mutateAsync({
 name: values.name,
 isActive: values.isActive,
 templateId: null,
 });
 toast.success(`Agent "${agent.name}" created`);
 setOpen(false);
 form.reset();
 router.push(`/agents/${agent.agentId}?tab=behavior`);
 }

 return (
 <Dialog open={open} onOpenChange={setOpen}>
 <DialogTrigger asChild>
 <Button>
 <Plus /> New agent
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Create agent</DialogTitle>
 <DialogDescription>
 Give your agent a name. You can configure voice, prompts, and
 webhooks next.
 </DialogDescription>
 </DialogHeader>
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
 <FormField
 control={form.control}
 name="name"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Name</FormLabel>
 <FormControl>
 <Input
 placeholder="e.g. Sales Qualifier"
 autoFocus
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 <FormField
 control={form.control}
 name="isActive"
 render={({ field }) => (
 <FormItem className="flex items-center justify-between border p-4">
 <div className="space-y-0.5">
 <Label>Activate immediately</Label>
 <p className="text-xs text-muted-foreground">
 If off, the agent will be created in paused state.
 </p>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />
 <DialogFooter>
 <Button
 type="button"
 variant="outline"
 onClick={() => setOpen(false)}
 disabled={createAgent.isPending}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={createAgent.isPending}>
 {createAgent.isPending ? (
 <>
 <Loader2 className="animate-spin" /> Creating…
 </>
 ) : (
 "Create agent"
 )}
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 );
}
