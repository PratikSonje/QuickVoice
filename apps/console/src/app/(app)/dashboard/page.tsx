// "use client";
// import { ChartAreaInteractive } from "../components/chart-area-interactive";
// import { SectionCards } from "../components/section-cards";
// import QuickVoiceLayout from "../../../../layout/RcmLayout";
// import { useAuth } from 'wasp/client/auth';
// import { DataTable } from "../../../components/Table/DataTable";
// import { createColumns } from "../../calls/components/columns/columns";
// import { Suspense, useMemo } from "react";
// import { DashboardSkeleton } from "../../../../../components/ui/loading-states";
// import { useCurrentOrganization } from "../../../../hooks/useCurrentOrganization";
// import { useCallLogs } from "../../calls/hooks";
// import { useAgents } from "../../agent/hooks";
// import { DEFAULT_COLUMN_VISIBILITY, FILTER_OPTIONS, MAX_VISIBLE_COLUMNS } from "../../calls/constants";
// import { TableSkeleton } from "../../../components/Table/TableSkeleton";

// function DashboardContent() {
//     const { data: user, isLoading: userLoading } = useAuth();
//     const { currentOrgId } = useCurrentOrganization();
//     const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useAgents(currentOrgId as string, user?.id as string);
//     const { data: callLogsData, isLoading: callLogsLoading, error: callLogsError } = useCallLogs(currentOrgId as string, user?.id as string);
//     const agents = agentsData?.agents;
//     const callLogs = callLogsData?.callLogs;
//     const columns = useMemo(() => createColumns(agents), [agents]);

//     if (userLoading) return null;

//     if (agentsError || callLogsError) return (
//         <QuickVoiceLayout user={user!}>
//             <div className="w-full p-4 md:p-6 2xl:p-10">
//                 <div className="mx-4 lg:mx-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
//                     <p className="text-destructive text-sm">Failed to load dashboard data. Please try refreshing the page.</p>
//                 </div>
//             </div>
//         </QuickVoiceLayout>
//     );

//     if (!user) return null;

//     return (
//         <QuickVoiceLayout user={user}>
//             <div className="w-full p-4 md:p-6 2xl:p-10">
//                 <div className="px-4 lg:px-6 mb-6">
//                     <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
//                     <p className="text-sm text-muted-foreground">
//                         Overview of your call activity and agent performance
//                     </p>
//                 </div>

//                 <div className="flex flex-col gap-6">
//                     <SectionCards />
//                     <div className="px-4 lg:px-6">
//                         <ChartAreaInteractive />
//                     </div>
//                     <div>
//                         <div className="px-4 lg:px-6 mb-2">
//                             <h2 className="text-lg font-semibold">Recent Calls</h2>
//                         </div>
//                         {agentsLoading || callLogsLoading ? (
//                             <TableSkeleton />
//                         ) : (
//                             <DataTable
//                                 columns={columns}
//                                 data={callLogs}
//                                 defaultColumnVisibility={DEFAULT_COLUMN_VISIBILITY}
//                                 maxVisibleColumns={MAX_VISIBLE_COLUMNS}
//                                 filterOptions={FILTER_OPTIONS}
//                                 emptyMessage="No recent calls. Activity will appear here once your agents start handling calls."
//                             />
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </QuickVoiceLayout>
//     );
// }

// export default function DashboardPage() {
//     return (
//         <Suspense
//             fallback={<DashboardSkeleton />}
//         >
//             <DashboardContent />
//         </Suspense>
//     );
// }