import * as React from "react";

import type { LocalMessage } from "@/features/public-report-box/types";

export function usePublicReportBoxState() {
  const [composer, setComposer] = React.useState("");
  const [messages, setMessages] = React.useState<LocalMessage[]>([]);
  const [sessionReportId, setSessionReportId] = React.useState<string | null>(null);
  const [locked, setLocked] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sentCount, setSentCount] = React.useState(0);
  const [editTarget, setEditTarget] = React.useState<{ localId: string; serverMessageId: string } | null>(null);
  const [imagePreview, setImagePreview] = React.useState<{ src: string; alt: string } | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  const [voiceError, setVoiceError] = React.useState<string | null>(null);
  const [voicePanelOpen, setVoicePanelOpen] = React.useState(false);
  const [cancelArmed, setCancelArmed] = React.useState(false);
  return { composer, setComposer, messages, setMessages, sessionReportId, setSessionReportId, locked, setLocked, sending, setSending, sentCount, setSentCount, editTarget, setEditTarget, imagePreview, setImagePreview, recording, setRecording, recordingSeconds, setRecordingSeconds, voiceError, setVoiceError, voicePanelOpen, setVoicePanelOpen, cancelArmed, setCancelArmed };
}
