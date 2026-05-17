"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { useCreateKb } from "@/src/hooks/queries/kb";
import { useAgents } from "@/src/hooks/queries/agents";
import { authClient } from "@/src/lib/auth-client";

const UNASSIGNED = "__none__";

const schema = z.object({
  name: z.string().min(2),
  url: z.string().url("Must be a valid URL"),
  agentId: z.string(),
});

type FormValues = z.infer<typeof schema>;

// TODO: swap to presigned S3 upload when `POST /v1/kb/upload-url` lands. Until
// then we only support URL-paste ingestion (sourceType = URL).
export function UploadDialog({ defaultAgentId }: { defaultAgentId?: string }) {
  const [open, setOpen] = useState(false);
  const { data: agents } = useAgents();
  const create = useCreateKb();
  const { data: session } = authClient.useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      url: "",
      agentId: defaultAgentId ?? UNASSIGNED,
    },
  });

  async function onSubmit(values: FormValues) {
    if (!session?.user || !session.session?.activeOrganizationId) {
      toast.error("Not signed in");
      return;
    }
    await create.mutateAsync({
      organizationId: session.session.activeOrganizationId,
      userId: session.user.id,
      agentId: values.agentId === UNASSIGNED ? null : values.agentId,
      documents: [
        {
          name: values.name,
          sourceType: "URL",
          url: values.url,
        },
      ],
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a document</DialogTitle>
          <DialogDescription>
            Paste a URL to ingest as a knowledge source. File uploads are
            coming soon.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Q4 pricing FAQ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attach to agent (optional)</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Leave unassigned</SelectItem>
                      {(agents ?? []).map((a) => (
                        <SelectItem key={a.agentId} value={a.agentId}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    You can attach it later from an agent&apos;s Knowledge tab.
                  </FormDescription>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={create.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? (
                  <>
                    <Loader2 className="animate-spin" /> Adding…
                  </>
                ) : (
                  "Add document"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
