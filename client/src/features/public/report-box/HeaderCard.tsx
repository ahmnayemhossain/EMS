import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/components/ui/primitives/utils";
import { BN } from "@/features/public/report-box/text";

export function HeaderCard({ reportNo, remaining, companyNameBn, companyValid, voiceError, onReset }: any) {
  return (
    <div className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 -mx-3 px-3 pb-3 backdrop-blur">
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><div className="text-muted-foreground text-[11px]">{BN.reportNo}:</div><div className="font-mono text-sm font-semibold leading-none">{reportNo}</div><div className="text-muted-foreground mt-2 text-[11px]">{BN.remaining}: <span className="font-mono text-foreground">{remaining}/10</span></div></div>
          <div className="w-[58%]"><Button variant="outline" className={cn("h-9 w-[90%] justify-center whitespace-normal px-3 text-xs", remaining <= 0 ? "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10" : "")} onClick={onReset}>{remaining <= 0 ? BN.limitButton : BN.newComplaintShort}</Button></div>
        </div>
        <div className="mt-3 grid gap-2"><div className="text-muted-foreground text-xs">{BN.hint}</div>{voiceError ? <div className="text-destructive text-xs">{voiceError}</div> : null}{!companyValid ? <div className="text-destructive text-xs">{BN.invalidHint}</div> : null}</div>
      </div>
      <div className="sr-only">{companyNameBn}</div>
    </div>
  );
}

