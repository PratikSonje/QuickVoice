"use client";

import { Phone } from "lucide-react";

import { PageHeader } from "@/src/components/common/PageHeader";
import { EmptyState } from "@/src/components/common/EmptyState";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/src/components/ui/table";
import { BuyNumberDrawer } from "@/src/components/numbers/BuyNumberDrawer";
import { AssignAgentSelect } from "@/src/components/numbers/AssignAgentSelect";
import { useNumbers } from "@/src/hooks/queries/numbers";

export default function NumbersPage() {
 const { data: numbers, isLoading } = useNumbers();

 return (
 <div className="flex flex-col gap-6">
 <PageHeader
 title="Phone numbers"
 description="Numbers you own and the agent each one is routed to."
 actions={<BuyNumberDrawer />}
 />

 {isLoading ? (
 <div className="space-y-2">
 {[...Array(4)].map((_, i) => (
 <Skeleton key={i} className="h-14 w-full" />
 ))}
 </div>
 ) : !numbers?.length ? (
 <EmptyState
 icon={Phone}
 title="No phone numbers yet"
 description="Buy a number from your telephony provider to start routing calls."
 action={<BuyNumberDrawer />}
 />
 ) : (
 <div className="overflow-hidden border bg-card">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Number</TableHead>
 <TableHead>Friendly name</TableHead>
 <TableHead>Provider</TableHead>
 <TableHead>Agent</TableHead>
 <TableHead className="w-[80px] text-right">SID</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {numbers.map((n) => (
 <TableRow key={n.phId}>
 <TableCell className="font-mono text-sm font-medium">
 {n.number}
 </TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {n.friendlyName || "—"}
 </TableCell>
 <TableCell>
 <Badge
 variant="secondary"
 className="uppercase tracking-wide"
 >
 {n.provider}
 </Badge>
 </TableCell>
 <TableCell>
 <AssignAgentSelect phId={n.phId} agentId={n.agentId} />
 </TableCell>
 <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
 {n.sid.slice(0, 8)}…
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 )}
 </div>
 );
}
