import * as React from "react";

export function usePublicReportBoxEffects({
  sentCount, cancelArmed, recording, composer, setRecordingSeconds, refs,
}: any) {
  React.useEffect(() => { refs.sentCountRef.current = sentCount; }, [refs.sentCountRef, sentCount]);
  React.useEffect(() => { refs.cancelArmedRef.current = cancelArmed; }, [cancelArmed, refs.cancelArmedRef]);
  React.useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setRecordingSeconds((value: number) => (refs.recordingSecondsRef.current = value + 1, value + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [recording, refs.recordingSecondsRef, setRecordingSeconds]);
  React.useEffect(() => { syncComposerHeight(refs.composerRef.current); }, [composer, refs.composerRef]);
}

export function useBottomScroll(refs: any, messageCount: number) {
  React.useLayoutEffect(() => {
    if (refs.atBottomRef.current) refs.bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount, refs.atBottomRef, refs.bottomRef]);
}

export function syncAtBottom(refs: any) {
  const el = refs.scrollRef.current;
  if (!el) return;
  refs.atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 64;
}

function syncComposerHeight(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = "0px";
  const next = Math.min(element.scrollHeight, Math.floor(window.innerHeight * 0.5));
  element.style.height = `${Math.max(44, next)}px`;
}
