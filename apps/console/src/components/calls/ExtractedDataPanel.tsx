"use client";

export function ExtractedDataPanel({
 data,
 evaluation,
}: {
 data: unknown;
 evaluation: unknown;
}) {
 const hasData = Array.isArray(data) && data.length > 0;
 const hasEval = Array.isArray(evaluation) && evaluation.length > 0;

 return (
 <div className="space-y-4">
 <div className="border bg-card p-5">
 <h3 className="mb-3 text-sm font-semibold">Extracted data</h3>
 {hasData ? (
 <pre className="max-h-64 overflow-auto bg-muted/50 p-3 font-mono text-xs">
 {JSON.stringify(data, null, 2)}
 </pre>
 ) : (
 <p className="text-xs text-muted-foreground">
 Nothing extracted for this call.
 </p>
 )}
 </div>
 <div className="border bg-card p-5">
 <h3 className="mb-3 text-sm font-semibold">Evaluation</h3>
 {hasEval ? (
 <pre className="max-h-64 overflow-auto bg-muted/50 p-3 font-mono text-xs">
 {JSON.stringify(evaluation, null, 2)}
 </pre>
 ) : (
 <p className="text-xs text-muted-foreground">
 No evaluation captured for this call.
 </p>
 )}
 </div>
 </div>
 );
}
