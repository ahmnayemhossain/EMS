import * as React from "react";

export function usePublicReportBoxRefs() {
  return {
    sentCountRef: React.useRef(0),
    cancelArmedRef: React.useRef(false),
    closeVoicePanelAfterStopRef: React.useRef(false),
    autoStopOnReleaseRef: React.useRef(false),
    ignoreNextClickRef: React.useRef(false),
    touchStartAtRef: React.useRef<number | null>(null),
    recorderRef: React.useRef<MediaRecorder | null>(null),
    chunksRef: React.useRef<BlobPart[]>([]),
    recordingSecondsRef: React.useRef(0),
    fileRef: React.useRef<HTMLInputElement | null>(null),
    composerRef: React.useRef<HTMLTextAreaElement | null>(null),
    scrollRef: React.useRef<HTMLDivElement | null>(null),
    bottomRef: React.useRef<HTMLDivElement | null>(null),
    atBottomRef: React.useRef(true),
  };
}
