import { Dialog, DialogContent } from "@/app/components/ui/dialog";

export function ImagePreviewDialog({ imagePreview, setImagePreview }: any) {
  return (
    <Dialog open={Boolean(imagePreview)} onOpenChange={(open) => (!open ? setImagePreview(null) : null)}>
      <DialogContent className="max-w-[min(920px,calc(100%-2rem))] p-3">
        {imagePreview ? <img src={imagePreview.src} alt={imagePreview.alt} className="max-h-[80svh] w-full rounded-md bg-muted/30 object-contain" /> : null}
      </DialogContent>
    </Dialog>
  );
}
