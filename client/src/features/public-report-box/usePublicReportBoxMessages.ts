import * as React from "react";

import { blobToDataUrl } from "@/features/public-report-box/helpers";
import { deleteInboxMessage, editInboxMessage, submitToInbox } from "@/features/public-report-box/api";

export function usePublicReportBoxMessages(args: any) {
  const pushLocalMessage = React.useCallback((message: any) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    args.state.setMessages((prev: any[]) => [...prev, { id, ...message }]);
    return id;
  }, [args.state]);

  const updateLocalMessage = React.useCallback((id: string, patch: any) => {
    args.state.setMessages((prev: any[]) => prev.map((message) => (message.id === id ? { ...message, ...patch } : message)));
  }, [args.state]);

  const saveEdit = React.useCallback(async () => {
    if (!args.state.editTarget || !args.state.sessionReportId || !args.state.composer.trim() || args.state.sending) return;
    args.state.setSending(true);
    const ok = await editInboxMessage({ reportId: args.state.sessionReportId, messageId: args.state.editTarget.serverMessageId, text: args.state.composer.trim() });
    args.state.setSending(false);
    if (ok) { updateLocalMessage(args.state.editTarget.localId, { text: args.state.composer.trim() }); args.state.setComposer(""); args.state.setEditTarget(null); }
  }, [args.state, updateLocalMessage]);

  const sendText = React.useCallback(async () => {
    if (args.state.editTarget) return saveEdit();
    const text = args.state.composer.trim();
    if (!text || !args.companyId || args.state.locked || args.remaining <= 0 || args.state.sending) return;
    const at = new Date().toISOString();
    const workerId = pushLocalMessage({ at, kind: "text", text, from: "worker", status: "sending" });
    args.state.setComposer(""); args.state.setSending(true);
    const res = await submitToInbox({ companyId: args.companyId, reportId: args.state.sessionReportId || undefined, kind: "text", text, at });
    handleSendResult({ res, workerId, pushLocalMessage, updateLocalMessage, state: args.state, refs: args.refs });
  }, [args.companyId, args.remaining, args.refs, args.state, pushLocalMessage, saveEdit, updateLocalMessage]);

  const onPickPhoto = React.useCallback(async (file: File | null) => {
    if (!file || !args.companyId || args.state.locked || args.remaining <= 0 || args.state.sending) return;
    const at = new Date().toISOString();
    const dataUrl = await blobToDataUrl(file);
    const workerId = pushLocalMessage({ at, kind: "photo", attachment: { mime: file.type || "image/*", name: file.name, dataUrl }, from: "worker", status: "sending" });
    args.state.setSending(true);
    const res = await submitToInbox({ companyId: args.companyId, reportId: args.state.sessionReportId || undefined, kind: "photo", dataUrl, mime: file.type || "image/*", at });
    handleSendResult({ res, workerId, pushLocalMessage, updateLocalMessage, state: args.state, refs: args.refs });
  }, [args.companyId, args.remaining, args.refs, args.state, pushLocalMessage, updateLocalMessage]);

  return { pushLocalMessage, updateLocalMessage, saveEdit, sendText, onPickPhoto, deleteInboxMessage };
}

async function handleSendResult({ res, workerId, pushLocalMessage, updateLocalMessage, state, refs }: any) {
  state.setSending(false);
  if (res.ok) {
    if (!state.sessionReportId && res.reportId) state.setSessionReportId(res.reportId);
    updateLocalMessage(workerId, { status: "success", serverMessageId: res.messageId });
    state.setSentCount((count: number) => count + 1);
    if (refs.sentCountRef.current + 1 >= 10) state.setLocked(true);
    return;
  }
  updateLocalMessage(workerId, { status: "error" });
  pushLocalMessage({ at: new Date().toISOString(), kind: "text", text: "নেটওয়ার্ক সমস্যা। পাঠানো যায়নি।", from: "ems", status: "error" });
}
