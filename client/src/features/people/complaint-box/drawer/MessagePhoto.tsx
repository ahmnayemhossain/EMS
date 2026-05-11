import type { ReportBoxAttachment } from "@/core/types/models/ems";

import { getAttachmentSrc } from "@/features/people/complaint-box/config/utils";

export function MessagePhoto({
  attachment,
  onPreview,
}: {
  attachment?: ReportBoxAttachment;
  onPreview: (src: string, alt: string) => void;
}) {
  const src = getAttachmentSrc(attachment);
  if (!src) return null;
  return (
    <button
      type="button"
      className="mt-2 block w-full cursor-zoom-in"
      onClick={() => onPreview(src, attachment?.name || "photo")}
      aria-label="Preview image"
    >
      <img src={src} alt={attachment?.name || "photo"} className="max-h-64 w-full rounded-xl bg-muted/30 object-contain" />
    </button>
  );
}
