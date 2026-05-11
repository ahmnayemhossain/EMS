import * as React from "react";

import { blobToDataUrl } from "@/features/public/report-box/helpers";
import { submitToInbox } from "@/features/public/report-box/api";
import { BN } from "@/features/public/report-box/text";

export function usePublicReportBoxVoice({ companyId, remaining, state, refs, pushLocalMessage, updateLocalMessage, setCancelArmedSync }: any) {
  const stopVoice = React.useCallback(() => {
    const recorder = refs.recorderRef.current;
    if (!recorder) return;
    state.setRecording(false);
    recorder.stop();
  }, [refs.recorderRef, state]);

  const startVoice = React.useCallback(async () => {
    if (!companyId || state.recording || state.locked || remaining <= 0 || state.sending) return;
    if (typeof window !== "undefined" && !window.isSecureContext) return state.setVoiceError(BN.micNeedsHttps);
    if (!navigator.mediaDevices?.getUserMedia) return state.setVoiceError(BN.micNotSupported);
    state.setVoiceError(null); state.setRecordingSeconds(0); refs.recordingSecondsRef.current = 0; refs.chunksRef.current = []; setCancelArmedSync(false);
    let stream: MediaStream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return state.setVoiceError(BN.micPermission); }
    let recorder: MediaRecorder; try { recorder = new MediaRecorder(stream, { mimeType: "audio/webm" }); } catch { recorder = new MediaRecorder(stream); }
    refs.recorderRef.current = recorder;
    recorder.ondataavailable = (event) => { if (event.data && event.data.size > 0) refs.chunksRef.current.push(event.data); };
    recorder.onstop = () => handleVoiceStop({ companyId, state, refs, pushLocalMessage, updateLocalMessage, setCancelArmedSync, stream });
    recorder.start(); state.setRecording(true);
  }, [companyId, remaining, refs, setCancelArmedSync, state, pushLocalMessage, updateLocalMessage]);

  return { startVoice, stopVoice };
}

async function handleVoiceStop({ companyId, state, refs, pushLocalMessage, updateLocalMessage, setCancelArmedSync, stream }: any) {
  try { stream.getTracks().forEach((track: MediaStreamTrack) => track.stop()); } catch {}
  if (refs.cancelArmedRef.current) return finishVoiceCancel(state, refs, setCancelArmedSync);
  if (refs.recordingSecondsRef.current < 1) return finishVoiceTooShort(state, refs, setCancelArmedSync);
  const at = new Date().toISOString();
  const dataUrl = await blobToDataUrl(new Blob(refs.chunksRef.current, { type: "audio/webm" }));
  const attachment = { mime: "audio/webm", name: "voice.webm", dataUrl };
  const workerId = pushLocalMessage({ at, kind: "voice", attachment, durationSec: refs.recordingSecondsRef.current, from: "worker", status: "sending" });
  state.setSending(true);
  const res = await submitToInbox({ companyId, reportId: state.sessionReportId || undefined, kind: "voice", dataUrl, mime: "audio/webm", durationSec: refs.recordingSecondsRef.current, at });
  state.setSending(false);
  if (res.ok) { if (!state.sessionReportId && res.reportId) state.setSessionReportId(res.reportId); updateLocalMessage(workerId, { status: "success", serverMessageId: res.messageId }); state.setSentCount((count: number) => count + 1); if (refs.sentCountRef.current + 1 >= 10) state.setLocked(true); }
  else { updateLocalMessage(workerId, { status: "error" }); pushLocalMessage({ at: new Date().toISOString(), kind: "text", text: BN.sendFailed, from: "ems", status: "error" }); }
  setCancelArmedSync(false); if (refs.closeVoicePanelAfterStopRef.current) { refs.closeVoicePanelAfterStopRef.current = false; state.setVoicePanelOpen(false); }
}

function finishVoiceCancel(state: any, refs: any, setCancelArmedSync: (value: boolean) => void) {
  refs.chunksRef.current = []; setCancelArmedSync(false);
  if (refs.closeVoicePanelAfterStopRef.current) { refs.closeVoicePanelAfterStopRef.current = false; state.setVoicePanelOpen(false); }
}

function finishVoiceTooShort(state: any, refs: any, setCancelArmedSync: (value: boolean) => void) {
  refs.chunksRef.current = []; setCancelArmedSync(false); refs.closeVoicePanelAfterStopRef.current = false; state.setVoicePanelOpen(false);
}
