import * as React from "react";
import { useParams } from "react-router";

import { BN } from "@/features/public-report-box/text";
import { ComposerBar } from "@/features/public-report-box/ComposerBar";
import { HeaderCard } from "@/features/public-report-box/HeaderCard";
import { ImagePreviewDialog } from "@/features/public-report-box/ImagePreviewDialog";
import { MessageList } from "@/features/public-report-box/MessageList";
import { formatClock, formatReportNumber, getCompanyBnName, getCompanyIdFromCode } from "@/features/public-report-box/helpers";
import { usePublicReportBoxEffects, useBottomScroll, syncAtBottom } from "@/features/public-report-box/usePublicReportBoxEffects";
import { usePublicReportBoxMessages } from "@/features/public-report-box/usePublicReportBoxMessages";
import { usePublicReportBoxRefs } from "@/features/public-report-box/usePublicReportBoxRefs";
import { usePublicReportBoxState } from "@/features/public-report-box/usePublicReportBoxState";
import { usePublicReportBoxVoice } from "@/features/public-report-box/usePublicReportBoxVoice";

export function PublicReportBoxPage() {
  const code = useParams().code;
  const companyId = getCompanyIdFromCode(code);
  const companyValid = Boolean(companyId);
  const companyNameBn = getCompanyBnName(companyId);
  const state = usePublicReportBoxState();
  const refs = usePublicReportBoxRefs();
  const remaining = Math.max(0, 10 - state.sentCount);
  const reportNo = formatReportNumber(state.sessionReportId);
  const setCancelArmedSync = React.useCallback((value: boolean) => { refs.cancelArmedRef.current = value; state.setCancelArmed(value); }, [refs.cancelArmedRef, state]);
  usePublicReportBoxEffects({ sentCount: state.sentCount, cancelArmed: state.cancelArmed, recording: state.recording, composer: state.composer, setRecordingSeconds: state.setRecordingSeconds, refs });
  useBottomScroll(refs, state.messages.length);
  const actions = usePublicReportBoxMessages({ companyId, remaining, state, refs });
  const voice = usePublicReportBoxVoice({ companyId, remaining, state, refs, pushLocalMessage: actions.pushLocalMessage, updateLocalMessage: actions.updateLocalMessage, setCancelArmedSync });

  return (
    <div className="h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-svh min-h-0 max-w-md flex-col">
        <header className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40 border-b backdrop-blur"><div className="px-3 py-3"><div className="truncate text-sm font-semibold leading-none">{BN.title}</div><div className="text-muted-foreground mt-1 truncate text-xs">{companyNameBn}</div></div></header>
        <div ref={refs.scrollRef} onScroll={() => syncAtBottom(refs)} className="flex-1 min-h-0 touch-pan-y overscroll-y-contain overflow-y-auto overflow-x-hidden px-3 py-4 pb-28 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"><div className="space-y-3"><HeaderCard reportNo={reportNo} remaining={remaining} companyNameBn={companyNameBn} companyValid={companyValid} voiceError={state.voiceError} onReset={() => { state.setVoiceError(null); state.setComposer(""); state.setMessages([]); state.setSessionReportId(null); state.setLocked(false); state.setSending(false); state.setSentCount(0); state.setEditTarget(null); refs.atBottomRef.current = true; state.setVoicePanelOpen(false); state.setImagePreview(null); }} />{remaining <= 0 ? <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3"><div className="text-destructive text-sm font-bold leading-relaxed">{BN.limitReachedCard}</div></div> : null}<MessageList messages={state.messages} sessionReportId={state.sessionReportId} sending={state.sending} editTarget={state.editTarget} setEditTarget={state.setEditTarget} setComposer={state.setComposer} setImagePreview={state.setImagePreview} onDeleteMessage={async (message: any) => { if (!state.sessionReportId || !message.serverMessageId) return; const ok = await actions.deleteInboxMessage({ reportId: state.sessionReportId, messageId: message.serverMessageId }); if (ok) { state.setMessages((prev: any[]) => prev.filter((item) => item.id !== message.id)); state.setSentCount((count) => Math.max(0, count - 1)); state.setLocked(false); if (state.editTarget?.localId === message.id) { state.setEditTarget(null); state.setComposer(""); } } }} bottomRef={refs.bottomRef} /></div></div>
        <ComposerBar companyValid={companyValid} remaining={remaining} state={state} refs={refs} actions={actions} voice={voice} formatClock={formatClock} setCancelArmedSync={setCancelArmedSync} />
      </div>
      <ImagePreviewDialog imagePreview={state.imagePreview} setImagePreview={state.setImagePreview} />
    </div>
  );
}
