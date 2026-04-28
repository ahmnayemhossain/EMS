import * as React from "react";
import {
  Camera,
  CheckCheck,
  LoaderCircle,
  Mic,
  Pencil,
  Send,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useParams } from "react-router";

import { facilities, getFacilityName } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { cn } from "@/app/components/ui/utils";
import { VoiceMessage } from "@/components/VoiceMessage";
import type { ReportBoxAttachment, ReportBoxMessageKind } from "@/types/ems";

type LocalMessage = {
  id: string;
  at: string;
  kind: ReportBoxMessageKind;
  text?: string;
  attachment?: ReportBoxAttachment;
  durationSec?: number;
  from: "worker" | "ems";
  emphasis?: "normal" | "success";
  action?: "new_report";
  status?: "sending" | "success" | "error";
  serverMessageId?: string;
};

const BN = {
  title: "\u0985\u09AD\u09BF\u09AF\u09CB\u0997 \u09AC\u0995\u09CD\u09B8",
  reportNo: "অভিযোগ নম্বর",
  remaining: "\u0995\u09A5\u09BE \u09AC\u09BE\u0995\u09BF \u0986\u099B\u09C7",
  newComplaintShort: "\u09A8\u09A4\u09C1\u09A8 \u0985\u09AD\u09BF\u09AF\u09CB\u0997",
  limitButton:
    "\u0986\u09AA\u09A8\u09BE\u09B0 \u09E7\u09E6\u099F\u09BF \u0995\u09A5\u09BE \u09B6\u09C7\u09B7\u0964 \u09A8\u09A4\u09C1\u09A8 \u0985\u09AD\u09BF\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8",
  limitReachedCard:
    "\u0986\u09AA\u09A8\u09BE\u09B0 \u09E7\u09E6\u099F\u09BF \u0995\u09A5\u09BE \u09B6\u09C7\u09B7 \u09B9\u09DF\u09C7 \u0997\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09A8\u09A4\u09C1\u09A8 \u0985\u09AD\u09BF\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8\u0964",
  invalidLink: "\u09B2\u09BF\u0982\u0995\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09DF",
  invalidHint:
    "অভিযোগ লিংকটি ঠিক নয়। ব্যবহার করুন: `/rb/hfl`, `/rb/qfl`, `/rb/fgl` ইত্যাদি।",
  hint:
    "\u09AC\u09BE\u09B0\u09CD\u09A4\u09BE \u09B2\u09BF\u0996\u09C1\u09A8 \u0985\u09A5\u09AC\u09BE \u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09AB\u09CB\u09A8 \u09A7\u09B0\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09C1\u09A8\u0964 \u099B\u09C7\u09DC\u09C7 \u09A6\u09BF\u09B2\u09C7\u0987 \u09AD\u09DF\u09C7\u09B8 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09AC\u09C7\u0964",
  startPrompt:
    "অভিযোগ করতে নিচে একটি বার্তা পাঠান।",
  attachPhoto: "\u099B\u09AC\u09BF \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09C1\u09A8",
  typeMsg: "\u098F\u0995\u099F\u09BF \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE \u09B2\u09BF\u0996\u09C1\u09A8\u2026",
  holdRecord: "\u09A7\u09B0\u09C7 \u09B0\u09C7\u0995\u09B0\u09CD\u09A1 \u0995\u09B0\u09C1\u09A8",
  send: "\u09AA\u09BE\u09A0\u09BE\u09A8",
  stop: "\u09A5\u09BE\u09AE\u09BE\u09A8",
  sec: "\u09B8\u09C7",
  ack:
    "ধন্যবাদ। আপনার অভিযোগ পেয়েছি — আমরা খুব দ্রুত কাজ করবো।",
  slideCancel: "\u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09A4\u09C7 \u09AC\u09BE\u09AE\u09C7 \u099F\u09BE\u09A8\u09C1\u09A8",
  releaseCancel: "\u099B\u09C7\u09DC\u09C7 \u09A6\u09BF\u09B2\u09C7 \u09AC\u09BE\u09A4\u09BF\u09B2 \u09B9\u09AC\u09C7",
  micNeedsHttps:
    "\u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09AB\u09CB\u09A8 \u099A\u09BE\u09B2\u09BE\u09A4\u09C7 HTTPS \u09A6\u09B0\u0995\u09BE\u09B0\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 https:// \u09A6\u09BF\u09DF\u09C7 \u0996\u09C1\u09B2\u09C1\u09A8\u0964",
  micNotSupported:
    "\u098F\u0987 \u09AC\u09CD\u09B0\u09BE\u0989\u099C\u09BE\u09B0\u09C7 \u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09AB\u09CB\u09A8 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u09A8\u09C7\u0987\u0964",
  micPermission: "\u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09AB\u09CB\u09A8 \u09AA\u09BE\u09B0\u09AE\u09BF\u09B6\u09A8 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u0964",
  sending: "\u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u099A\u09CD\u099B\u09C7\u2026",
  sent: "\u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964",
  sendFailed:
    "\u09A8\u09C7\u099F\u0993\u09DF\u09BE\u09B0\u09CD\u0995 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE\u0964 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09AF\u09BE\u09DF\u09A8\u09BF\u0964",
  edit: "\u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE",
  delete: "\u09AE\u09C1\u099B\u09C1\u09A8",
  save: "\u09B8\u09C7\u09AD \u0995\u09B0\u09C1\u09A8",
  cancel: "\u09AC\u09BE\u09A4\u09BF\u09B2",
  play: "\u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8",
  pause: "\u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C1\u09A8",
} as const;

function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function formatReportNumber(reportId: string | null) {
  const yy = String(new Date().getFullYear() % 100).padStart(2, "0");
  if (!reportId) return `${yy}/---`;
  const digits = reportId.replace(/\D/g, "");
  const tail = (digits.slice(-3) || "0").padStart(3, "0");
  return `${yy}/${tail}`;
}

function getCompanyIdFromCode(code?: string | null) {
  if (!code) return undefined;
  const norm = String(code).trim().toLowerCase();
  return facilities.find((f) => f.code.toLowerCase() === norm)?.id;
}

function getCompanyBnName(companyId?: string | null) {
  const code = facilities.find((f) => f.id === companyId)?.code?.toLowerCase();
  const dict: Record<string, string> = {
    hfl: "\u098F\u099A\u098F\u09AB\u098F\u09B2 (\u09B9\u09CD\u09AF\u09BE\u09AC\u09BF\u099F\u09BE\u09B8 \u09AB\u09CD\u09AF\u09BE\u09B6\u09A8 \u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1)",
    qfl: "\u0995\u09BF\u0989\u098F\u09AB\u098F\u09B2",
    fgl: "\u098F\u09AB\u099C\u09BF\u098F\u09B2",
    afl: "\u098F\u098F\u09AB\u098F\u09B2",
    kadl: "\u0995\u09C7\u098F\u09A1\u098F\u09B2",
    rsbl: "\u0986\u09B0\u098F\u09B8\u09AC\u09BF\u098F\u09B2",
    sarah: "\u09B8\u09BE\u09B0\u09BE\u09B9 \u09B0\u09BF\u09B8\u09CB\u09B0\u09CD\u099F",
    dtr: "\u09A1\u09BE\u0989\u09A8\u099F\u09BE\u0989\u09A8 \u09B0\u09BF\u09B8\u09CB\u09B0\u09CD\u099F",
  };
  return code && dict[code] ? dict[code] : companyId ? getFacilityName(companyId) : BN.invalidLink;
}

async function submitToInbox(input: {
  companyId: string;
  kind: "text" | "voice" | "photo";
  reportId?: string;
  text?: string;
  dataUrl?: string;
  mime?: string;
  durationSec?: number;
  at?: string;
}) {
  try {
    const res = await fetch("/api/report-box/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok || !data || !data.ok) return { ok: false as const };
    return {
      ok: true as const,
      reportId: typeof data.reportId === "string" ? data.reportId : undefined,
      messageId: typeof data.messageId === "string" ? data.messageId : undefined,
    };
  } catch {
    return { ok: false as const };
  }
}

async function editInboxMessage(input: { reportId: string; messageId: string; text: string }) {
  try {
    const res = await fetch("/api/report-box/message/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => null)) as any;
    return Boolean(res.ok && data && data.ok);
  } catch {
    return false;
  }
}

async function deleteInboxMessage(input: { reportId: string; messageId: string }) {
  try {
    const res = await fetch("/api/report-box/message/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => null)) as any;
    return Boolean(res.ok && data && data.ok);
  } catch {
    return false;
  }
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("\u09AB\u09BE\u0987\u09B2 \u09AA\u09DC\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}

export function PublicReportBoxPage() {
  const params = useParams();

  const companyId = React.useMemo(() => getCompanyIdFromCode(params.code), [params.code]);
  const companyValid = Boolean(companyId);
  const companyNameBn = getCompanyBnName(companyId);

  const [composer, setComposer] = React.useState("");
  const [messages, setMessages] = React.useState<LocalMessage[]>([]);
  const [sessionReportId, setSessionReportId] = React.useState<string | null>(null);
  const [locked, setLocked] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sentCount, setSentCount] = React.useState(0);
  const sentCountRef = React.useRef(0);

  const [editTarget, setEditTarget] = React.useState<{ localId: string; serverMessageId: string } | null>(null);
  const [imagePreview, setImagePreview] = React.useState<{ src: string; alt: string } | null>(null);

  const [recording, setRecording] = React.useState(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  const [voiceError, setVoiceError] = React.useState<string | null>(null);
  const [voicePanelOpen, setVoicePanelOpen] = React.useState(false);
  const [cancelArmed, setCancelArmed] = React.useState(false);
  const cancelArmedRef = React.useRef(false);
  const closeVoicePanelAfterStopRef = React.useRef(false);
  const autoStopOnReleaseRef = React.useRef(false);
  const ignoreNextClickRef = React.useRef(false);
  const touchStartAtRef = React.useRef<number | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const recordingSecondsRef = React.useRef(0);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const composerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const atBottomRef = React.useRef(true);

  const pushLocalMessage = React.useCallback((m: Omit<LocalMessage, "id">) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setMessages((prev) => [...prev, { id, ...m }]);
    return id;
  }, []);

  const updateLocalMessage = React.useCallback((id: string, patch: Partial<LocalMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const resetForNewReport = React.useCallback(() => {
    try {
      recorderRef.current?.stop();
    } catch {
      // ignore
    }
    recorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);
    setRecordingSeconds(0);
    recordingSecondsRef.current = 0;
    setVoiceError(null);
    setComposer("");
    setMessages([]);
    setSessionReportId(null);
    setLocked(false);
    setSending(false);
    setSentCount(0);
    setEditTarget(null);
    atBottomRef.current = true;
    setVoicePanelOpen(false);
    setImagePreview(null);
  }, []);

  React.useEffect(() => {
    sentCountRef.current = sentCount;
  }, [sentCount]);

  React.useEffect(() => {
    if (!recording) return;
    const t = window.setInterval(() => {
      setRecordingSeconds((s) => {
        const next = s + 1;
        recordingSecondsRef.current = next;
        return next;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [recording]);

  const remaining = Math.max(0, 10 - sentCount);
  const reportNo = formatReportNumber(sessionReportId);

  React.useEffect(() => {
    cancelArmedRef.current = cancelArmed;
  }, [cancelArmed]);

  const setCancelArmedSync = React.useCallback((v: boolean) => {
    cancelArmedRef.current = v;
    setCancelArmed(v);
  }, []);

  const syncComposerHeight = React.useCallback(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, Math.floor(window.innerHeight * 0.5));
    el.style.height = `${Math.max(44, next)}px`;
  }, []);

  React.useEffect(() => {
    syncComposerHeight();
  }, [composer, syncComposerHeight]);

  const syncAtBottom = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    atBottomRef.current = gap < 64;
  }, []);

  React.useLayoutEffect(() => {
    if (!atBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const saveEdit = React.useCallback(async () => {
    if (!editTarget || !sessionReportId) return;
    const next = composer.trim();
    if (!next) return;
    if (sending) return;
    setSending(true);
    const ok = await editInboxMessage({
      reportId: sessionReportId,
      messageId: editTarget.serverMessageId,
      text: next,
    });
    setSending(false);
    if (ok) {
      updateLocalMessage(editTarget.localId, { text: next });
      setComposer("");
      setEditTarget(null);
      // admin inbox list needs a refresh to pick up updated subject; worker UI is already updated
    }
  }, [composer, editTarget, sending, sessionReportId, updateLocalMessage]);

  const sendText = React.useCallback(async () => {
    if (editTarget) {
      await saveEdit();
      return;
    }

    const text = composer.trim();
    if (!text) return;
    if (!companyId) return;
    if (locked || remaining <= 0) return;
    if (sending) return;

    const at = new Date().toISOString();
    const workerId = pushLocalMessage({ at, kind: "text", text, from: "worker", status: "sending" });
    setComposer("");

    setSending(true);
    const res = await submitToInbox({
      companyId,
      reportId: sessionReportId || undefined,
      kind: "text",
      text,
      at,
    });
    setSending(false);

    if (res.ok) {
      if (!sessionReportId && res.reportId) setSessionReportId(res.reportId);
      updateLocalMessage(workerId, { status: "success", serverMessageId: res.messageId });
      setSentCount((c) => c + 1);
      if (sentCountRef.current + 1 >= 10) setLocked(true);
    } else {
      updateLocalMessage(workerId, { status: "error" });
      pushLocalMessage({
        at: new Date().toISOString(),
        kind: "text",
        text: BN.sendFailed,
        from: "ems",
        status: "error",
      });
    }
  }, [composer, editTarget, companyId, locked, pushLocalMessage, remaining, saveEdit, sending, sessionReportId, updateLocalMessage]);

  const startVoice = React.useCallback(async () => {
    setVoiceError(null);
    if (!companyId) return;
    if (recording) return;
    if (locked || remaining <= 0) return;
    if (sending) return;
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setVoiceError(BN.micNeedsHttps);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError(BN.micNotSupported);
      return;
    }

    setRecordingSeconds(0);
    recordingSecondsRef.current = 0;
    chunksRef.current = [];
    setCancelArmedSync(false);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setVoiceError(BN.micPermission);
      return;
    }

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    } catch {
      recorder = new MediaRecorder(stream);
    }
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }

      // WhatsApp-like: if user swiped to cancel before release, discard silently
      if (cancelArmedRef.current) {
        chunksRef.current = [];
        setCancelArmedSync(false);
        if (closeVoicePanelAfterStopRef.current) {
          closeVoicePanelAfterStopRef.current = false;
          setVoicePanelOpen(false);
        } else {
          closeVoicePanelAfterStopRef.current = false;
        }
        return;
      }

      const at = new Date().toISOString();
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      if (recordingSecondsRef.current < 1) {
        chunksRef.current = [];
        setCancelArmedSync(false);
        // Too short: do not send; return to normal input mode.
        closeVoicePanelAfterStopRef.current = false;
        setVoicePanelOpen(false);
        return;
      }
      const dataUrl = await blobToDataUrl(blob);
      const attachment: ReportBoxAttachment = { mime: "audio/webm", name: "voice.webm", dataUrl };

      const workerId = pushLocalMessage({
        at,
        kind: "voice",
        attachment,
        durationSec: recordingSecondsRef.current,
        from: "worker",
        status: "sending",
      });

      setSending(true);
      const res = await submitToInbox({
        companyId,
        reportId: sessionReportId || undefined,
        kind: "voice",
        dataUrl,
        mime: "audio/webm",
        durationSec: recordingSecondsRef.current,
        at,
      });
      setSending(false);

      if (res.ok) {
        if (!sessionReportId && res.reportId) setSessionReportId(res.reportId);
        updateLocalMessage(workerId, { status: "success", serverMessageId: res.messageId });
        setSentCount((c) => c + 1);
        if (sentCountRef.current + 1 >= 10) setLocked(true);
      } else {
        updateLocalMessage(workerId, { status: "error" });
        pushLocalMessage({
          at: new Date().toISOString(),
          kind: "text",
          text: BN.sendFailed,
          from: "ems",
          status: "error",
        });
      }

      setCancelArmedSync(false);
      if (closeVoicePanelAfterStopRef.current) {
        closeVoicePanelAfterStopRef.current = false;
        setVoicePanelOpen(false);
      }
    };

    recorder.start();
    setRecording(true);
  }, [companyId, locked, recording, remaining, sending, sessionReportId, pushLocalMessage, setCancelArmedSync, updateLocalMessage]);

  const stopVoice = React.useCallback(() => {
    const r = recorderRef.current;
    if (!r) return;
    setRecording(false);
    r.stop();
  }, []);

  const onPickPhoto = React.useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (!companyId) return;
      if (locked || remaining <= 0) return;
      if (sending) return;
      const at = new Date().toISOString();
      const dataUrl = await blobToDataUrl(file);
      const attachment: ReportBoxAttachment = { mime: file.type || "image/*", name: file.name, dataUrl };

      const workerId = pushLocalMessage({ at, kind: "photo", attachment, from: "worker", status: "sending" });

      setSending(true);
      const res = await submitToInbox({
        companyId,
        reportId: sessionReportId || undefined,
        kind: "photo",
        dataUrl,
        mime: file.type || "image/*",
        at,
      });
      setSending(false);

      if (res.ok) {
        if (!sessionReportId && res.reportId) setSessionReportId(res.reportId);
        updateLocalMessage(workerId, { status: "success", serverMessageId: res.messageId });
        setSentCount((c) => c + 1);
        if (sentCountRef.current + 1 >= 10) setLocked(true);
      } else {
        updateLocalMessage(workerId, { status: "error" });
        pushLocalMessage({
          at: new Date().toISOString(),
          kind: "text",
          text: BN.sendFailed,
          from: "ems",
          status: "error",
        });
      }
    },
    [companyId, locked, remaining, pushLocalMessage, sending, sessionReportId, updateLocalMessage],
  );

  function renderStatusIcon(m: LocalMessage) {
    if (m.from !== "worker") return null;
    if (!m.status) return null;
    if (m.status === "sending") return <LoaderCircle className="size-4 animate-spin text-muted-foreground" />;
    if (m.status === "success") return <CheckCheck className="size-4 text-[var(--success-700)]" />;
    if (m.status === "error") return <TriangleAlert className="size-4 text-destructive" />;
    return null;
  }

  return (
    <div className="h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-svh min-h-0 max-w-md flex-col">
        <header className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40 border-b backdrop-blur">
          <div className="px-3 py-3">
            <div className="truncate text-sm font-semibold leading-none">{BN.title}</div>
            <div className="text-muted-foreground mt-1 truncate text-xs">{companyNameBn}</div>
          </div>
        </header>

        <div
          ref={scrollRef}
          onScroll={syncAtBottom}
          className="flex-1 min-h-0 touch-pan-y overscroll-y-contain overflow-y-auto overflow-x-hidden px-3 py-4 pb-28 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
        >
          <div className="space-y-3">
            <div className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 -mx-3 px-3 pb-3 backdrop-blur">
              <div className="rounded-xl border bg-card p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-muted-foreground text-[11px]">{BN.reportNo}:</div>
                    <div className="font-mono text-sm font-semibold leading-none">{reportNo}</div>
                    <div className="text-muted-foreground mt-2 text-[11px]">
                      {BN.remaining}: <span className="font-mono text-foreground">{remaining}/10</span>
                    </div>
                  </div>
                  <div className="w-[58%]">
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-[90%] justify-center whitespace-normal px-3 text-xs",
                        remaining <= 0 ? "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10" : "",
                      )}
                      onClick={resetForNewReport}
                    >
                      {remaining <= 0 ? BN.limitButton : BN.newComplaintShort}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="text-muted-foreground text-xs">{BN.hint}</div>
                  {voiceError ? <div className="text-destructive text-xs">{voiceError}</div> : null}
                  {!companyValid ? <div className="text-destructive text-xs">{BN.invalidHint}</div> : null}
                </div>
              </div>
            </div>

            {remaining <= 0 ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
                <div className="text-destructive text-sm font-bold leading-relaxed">
                  {BN.limitReachedCard}
                </div>
              </div>
            ) : null}

            {messages.length ? (
              <div className="space-y-2">
                {messages.map((m) => {
                  const isWorker = m.from === "worker";
                  const canServerMutate = Boolean(sessionReportId && m.serverMessageId && !sending);
                  return (
                    <div key={m.id} className={cn("flex", m.from === "ems" ? "justify-start" : "justify-end")}>
                      <div
                        className={cn(
                          "max-w-[88%] rounded-2xl border px-3 py-2 shadow-sm",
                          m.from === "ems"
                            ? m.emphasis === "success"
                              ? "bg-[var(--success-50)] border-[var(--success-100)]"
                              : "bg-muted/30 border-border"
                            : "bg-primary/10 border-primary/20",
                        )}
                      >
                        {isWorker && canServerMutate ? (
                          <div className="mb-1 flex items-center justify-end gap-1">
                            {m.kind === "text" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:bg-muted/30"
                                aria-label={BN.edit}
                                onClick={() => {
                                  if (!m.serverMessageId) return;
                                  setEditTarget({ localId: m.id, serverMessageId: m.serverMessageId });
                                  setComposer(m.text || "");
                                  window.setTimeout(() => composerRef.current?.focus(), 0);
                                }}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:bg-muted/30"
                              aria-label={BN.delete}
                              onClick={async () => {
                                if (!sessionReportId || !m.serverMessageId) return;
                                const ok = await deleteInboxMessage({
                                  reportId: sessionReportId,
                                  messageId: m.serverMessageId,
                                });
                                if (ok) {
                                  setMessages((prev) => prev.filter((x) => x.id !== m.id));
                                  setSentCount((c) => Math.max(0, c - 1));
                                  setLocked(false);
                                  if (editTarget?.localId === m.id) {
                                    setEditTarget(null);
                                    setComposer("");
                                  }
                                }
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        ) : null}

                        {m.kind === "text" ? (
                          <div className={cn(m.emphasis === "success" ? "text-base font-semibold leading-relaxed" : "text-sm leading-relaxed")}>
                            <span className="inline-flex items-start gap-2">
                              {m.from === "ems" && m.status === "sending" ? (
                                <LoaderCircle className="mt-0.5 size-4 animate-spin text-muted-foreground" />
                              ) : m.from === "ems" && m.status === "success" ? (
                                <CheckCheck className="mt-0.5 size-4 text-[var(--success-700)]" />
                              ) : m.from === "ems" && m.status === "error" ? (
                                <TriangleAlert className="mt-0.5 size-4 text-destructive" />
                              ) : null}
                              <span>{m.text}</span>
                            </span>
                          </div>
                        ) : null}

                        {m.kind === "voice" && m.attachment?.dataUrl ? (
                          <VoiceMessage
                            src={m.attachment.dataUrl}
                            durationSec={m.durationSec}
                            density="compact"
                            variant="whatsapp"
                            labels={{ play: BN.play, pause: BN.pause }}
                            className="min-w-[220px]"
                          />
                        ) : null}

                        {m.kind === "photo" && m.attachment?.dataUrl ? (
                          <button
                            type="button"
                            className="mt-1 block w-full cursor-zoom-in"
                            onClick={() =>
                              setImagePreview({
                                src: m.attachment!.dataUrl!,
                                alt: m.attachment?.name || "\u099B\u09AC\u09BF",
                              })
                            }
                            aria-label="Preview image"
                          >
                            <img
                              src={m.attachment.dataUrl}
                              alt={m.attachment.name || "\u099B\u09AC\u09BF"}
                              className="max-h-64 w-full rounded-xl bg-muted/30 object-contain"
                            />
                          </button>
                        ) : null}

                        {m.from === "worker" ? (
                          <div className="mt-2 flex items-center justify-end">{renderStatusIcon(m)}</div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            ) : (
              <div className="text-muted-foreground rounded-xl border bg-card p-4 text-sm">{BN.startPrompt}</div>
            )}
          </div>
        </div>

        <div className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky bottom-0 z-40 border-t backdrop-blur">
          {editTarget ? (
            <div className="px-3 pt-2">
              <div className="rounded-xl border bg-card px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-muted-foreground truncate">{BN.edit}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      setEditTarget(null);
                      setComposer("");
                    }}
                    disabled={sending}
                  >
                    <X className="mr-2 size-4" />
                    {BN.cancel}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-end gap-2 px-3 py-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
            />
            <Button
              variant="outline"
              size="icon"
              aria-label={BN.attachPhoto}
              onClick={() => fileRef.current?.click()}
              disabled={!companyValid || locked || sending || remaining <= 0 || recording || voicePanelOpen}
            >
              <Camera className="size-4" />
            </Button>

            <div className="flex-1">
              {voicePanelOpen ? (
                <div className="rounded-xl border bg-card px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      aria-label={BN.delete}
                      onClick={() => {
                        if (recording) {
                          setCancelArmedSync(true);
                          closeVoicePanelAfterStopRef.current = true;
                          stopVoice();
                          return;
                        }
                        setVoicePanelOpen(false);
                      }}
                      disabled={sending}
                    >
                      <Trash2 className="size-4" />
                    </Button>

                    <div className="flex flex-col items-center">
                      <div className="mb-1 flex items-center gap-1 text-xs">
                        <span
                          className={cn(
                            "inline-block h-1.5 w-1.5 rounded-full",
                            recording ? "bg-destructive animate-pulse" : "bg-muted-foreground/40",
                          )}
                        />
                        <span className={cn("font-mono", recording ? "text-foreground" : "text-muted-foreground")}>
                          {formatClock(recordingSeconds)}
                        </span>
                      </div>
                      <Button
                        variant={recording ? "destructive" : "outline"}
                        size="icon"
                        className={cn(
                          "h-10 w-10 rounded-full",
                          recording ? "shadow-[0_0_0_6px_rgba(239,68,68,0.10)]" : "",
                        )}
                        aria-label={recording ? BN.stop : BN.holdRecord}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          closeVoicePanelAfterStopRef.current = true;
                          if (!recording) void startVoice();
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          closeVoicePanelAfterStopRef.current = true;
                          stopVoice();
                        }}
                        onPointerDown={(e) => {
                          e.currentTarget.setPointerCapture?.(e.pointerId);
                          closeVoicePanelAfterStopRef.current = true;
                          if (!recording) void startVoice();
                        }}
                        onPointerUp={() => {
                          closeVoicePanelAfterStopRef.current = true;
                          stopVoice();
                        }}
                        onPointerCancel={() => {
                          closeVoicePanelAfterStopRef.current = true;
                          stopVoice();
                        }}
                        disabled={!companyValid || locked || sending || remaining <= 0}
                      >
                        <Mic className="size-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-9 w-9", recording ? "text-[var(--success-700)]" : "text-muted-foreground")}
                      aria-label={BN.send}
                      onClick={() => {
                        closeVoicePanelAfterStopRef.current = true;
                        stopVoice();
                      }}
                      disabled={!recording || sending}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Textarea
                  ref={(n) => {
                    composerRef.current = n;
                  }}
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder={BN.typeMsg}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendText();
                    }
                  }}
                  disabled={!companyValid || locked || sending || remaining <= 0 || recording}
                  className="min-h-11"
                />
              )}
            </div>

            {composer.trim().length > 0 || editTarget ? (
              <Button
                size="icon"
                aria-label={BN.send}
                onClick={sendText}
                disabled={!companyValid || locked || sending || remaining <= 0 || recording || !composer.trim()}
              >
                <Send className="size-4" />
              </Button>
            ) : (
              <Button
                variant={recording ? "destructive" : "outline"}
                size="icon"
                aria-label={recording ? BN.stop : BN.holdRecord}
                onClick={() => {
                  if (ignoreNextClickRef.current) {
                    ignoreNextClickRef.current = false;
                    return;
                  }
                  // Single click: open card + start recording (keeps recording until Send/Delete).
                  autoStopOnReleaseRef.current = false;
                  closeVoicePanelAfterStopRef.current = true;
                  setVoicePanelOpen(true);
                  if (!recording) void startVoice();
                }}
                onTouchStart={(e) => {
                  // Tap & hold (mobile): start instantly and auto-send on release.
                  e.preventDefault();
                  ignoreNextClickRef.current = true;
                  if (recording) return;
                  touchStartAtRef.current = Date.now();
                  autoStopOnReleaseRef.current = true;
                  closeVoicePanelAfterStopRef.current = true;
                  setVoicePanelOpen(true);
                  void startVoice();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (!autoStopOnReleaseRef.current) return;
                  const startedAt = touchStartAtRef.current;
                  touchStartAtRef.current = null;
                  const heldMs = startedAt ? Date.now() - startedAt : 0;

                  // WhatsApp-like:
                  // - quick tap opens the voice card and keeps recording (manual Send/Delete)
                  // - hold + release auto-sends
                  if (heldMs > 0 && heldMs < 220) {
                    autoStopOnReleaseRef.current = false;
                    return;
                  }

                  stopVoice();
                  autoStopOnReleaseRef.current = false;
                }}
                disabled={!companyValid || locked || sending || remaining <= 0}
              >
                <Mic className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={Boolean(imagePreview)} onOpenChange={(o) => (!o ? setImagePreview(null) : null)}>
        <DialogContent className="max-w-[min(920px,calc(100%-2rem))] p-3">
          {imagePreview ? (
            <img
              src={imagePreview.src}
              alt={imagePreview.alt}
              className="max-h-[80svh] w-full rounded-md bg-muted/30 object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
