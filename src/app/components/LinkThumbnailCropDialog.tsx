import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ZoomIn, ZoomOut } from "lucide-react";

import { useDashboardI18n } from "@/app/dashboard-i18n/use-dashboard-i18n";
import {
  LINK_THUMB_ASPECT,
  exportCroppedLinkThumbnail,
  loadImageFromFile,
  revokeImageObjectUrl,
  type CropTransform,
} from "@/lib/link-thumbnail-image";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Slider } from "./ui/slider";

type LinkThumbnailCropDialogProps = {
  open: boolean;
  file: File | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => void;
};

const VIEWPORT_W = 320;

export function LinkThumbnailCropDialog({
  open,
  file,
  onOpenChange,
  onConfirm,
}: LinkThumbnailCropDialogProps) {
  const { t } = useDashboardI18n();
  const viewportH = VIEWPORT_W / LINK_THUMB_ASPECT;

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<CropTransform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [exporting, setExporting] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseOffsetX: number;
    baseOffsetY: number;
  } | null>(null);

  useEffect(() => {
    if (!open || !file) {
      setImage((prev) => {
        revokeImageObjectUrl(prev);
        return null;
      });
      setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
      return;
    }
    let cancelled = false;
    loadImageFromFile(file)
      .then((img) => {
        if (!cancelled) {
          setImage((prev) => {
            revokeImageObjectUrl(prev);
            return img;
          });
          setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
        } else {
          revokeImageObjectUrl(img);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(t.linkImageCropFailed);
          onOpenChange(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, file, onOpenChange, t.linkImageCropFailed]);

  const coverScale =
    image != null
      ? Math.max(
          VIEWPORT_W / image.naturalWidth,
          viewportH / image.naturalHeight,
        ) * transform.scale
      : 1;

  const drawW = image ? image.naturalWidth * coverScale : 0;
  const drawH = image ? image.naturalHeight * coverScale : 0;
  const drawX = (VIEWPORT_W - drawW) / 2 + transform.offsetX;
  const drawY = (viewportH - drawH) / 2 + transform.offsetY;

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!image) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        baseOffsetX: transform.offsetX,
        baseOffsetY: transform.offsetY,
      };
    },
    [image, transform.offsetX, transform.offsetY],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    setTransform((prev) => ({
      ...prev,
      offsetX: drag.baseOffsetX + (e.clientX - drag.startX),
      offsetY: drag.baseOffsetY + (e.clientY - drag.startY),
    }));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  }, []);

  async function handleConfirm() {
    if (!image || !file) return;
    setExporting(true);
    try {
      const cropped = await exportCroppedLinkThumbnail(
        image,
        VIEWPORT_W,
        viewportH,
        transform,
        file.name.replace(/\.\w+$/, "") + "-thumb.jpg",
      );
      onConfirm(cropped);
      setImage((prev) => {
        revokeImageObjectUrl(prev);
        return null;
      });
      onOpenChange(false);
    } catch {
      toast.error(t.linkImageCropFailed);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.linkCropTitle}</DialogTitle>
          <DialogDescription className="text-pretty">
            {t.linkCropDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="relative mx-auto touch-none overflow-hidden rounded-xl border-2 border-violet-300/60 bg-muted shadow-inner ring-1 ring-border/50"
            style={{ width: VIEWPORT_W, height: viewportH }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="img"
            aria-label={t.linkCropFrameAria}
          >
            {image && (
              <img
                src={image.src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute max-w-none select-none"
                style={{
                  width: drawW,
                  height: drawH,
                  left: drawX,
                  top: drawY,
                }}
              />
            )}
            <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/30" />
          </div>

          <div className="flex items-center gap-3 px-1">
            <ZoomOut className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Slider
              min={1}
              max={2.5}
              step={0.02}
              value={[transform.scale]}
              onValueChange={([v]) =>
                setTransform((prev) => ({ ...prev, scale: v ?? 1 }))
              }
              aria-label={t.linkCropZoomAria}
            />
            <ZoomIn className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {t.linkCropHint}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={exporting}
            onClick={() => onOpenChange(false)}
          >
            {t.dialogCancel}
          </Button>
          <Button type="button" disabled={!image || exporting} onClick={handleConfirm}>
            {exporting ? t.linkCropApplying : t.linkCropApply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
