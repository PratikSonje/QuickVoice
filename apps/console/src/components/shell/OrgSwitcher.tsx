"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronsUpDown, Plus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar";
import { Skeleton } from "@/src/components/ui/skeleton";
import { authClient } from "@/src/lib/auth-client";

export function OrgSwitcher({ activeOrgId }: { activeOrgId: string }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: organizations, isPending } = authClient.useListOrganizations();

  const active = organizations?.find((o) => o.id === activeOrgId);

  async function switchTo(orgId: string) {
    if (orgId === activeOrgId) return;
    const { error } = await authClient.organization.setActive({
      organizationId: orgId,
    });
    if (error) {
      toast.error(error.message || "Could not switch organization");
      return;
    }
    queryClient.clear();
    router.refresh();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {active?.logo ? (
                  <img
                    src={active.logo}
                    alt={active.name}
                    className="size-5 rounded"
                  />
                ) : (
                  <Building2 className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {active ? (
                  <>
                    <span className="truncate font-medium">{active.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      @{active.slug}
                    </span>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="mt-1 h-2.5 w-16" />
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {isPending ? (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Loading…
              </div>
            ) : (
              (organizations ?? []).map((org) => {
                const isActive = org.id === activeOrgId;
                return (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => switchTo(org.id)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-muted/40">
                      <Building2 className="size-3.5" />
                    </div>
                    <div className="flex-1 truncate">{org.name}</div>
                    {isActive ? (
                      <Check className="size-4 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                );
              })
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push("/orgs/create")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                New organization
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push("/orgs")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Building2 className="size-3.5" />
              </div>
              <div className="font-medium text-muted-foreground">
                Manage organizations
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
