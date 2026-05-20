/** Matches link card banner (`aspect-video` / 16:9). */
export const LINK_THUMB_ASPECT = 16 / 9;
export const LINK_THUMB_MAX_BYTES = 2 * 1024 * 1024;
export const LINK_THUMB_OUTPUT_WIDTH = 1280;
export const LINK_THUMB_OUTPUT_HEIGHT = 720;
export const LINK_THUMB_MIN_EDGE = 640;

export type LinkThumbValidationIssue = "type" | "size" | "dimensions";

export function validateLinkThumbnailFile(file: File): LinkThumbValidationIssue | null {
  if (!file.type.startsWith("image/")) return "type";
  if (file.size > LINK_THUMB_MAX_BYTES) return "size";
  return null;
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load_failed"));
    };
    img.src = url;
  });
}

export function revokeImageObjectUrl(img: HTMLImageElement | null): void {
  if (img?.src.startsWith("blob:")) {
    URL.revokeObjectURL(img.src);
  }
}

export async function validateLinkThumbnailDimensions(
  file: File,
): Promise<LinkThumbValidationIssue | null> {
  try {
    const img = await loadImageFromFile(file);
    const minEdge = Math.min(img.naturalWidth, img.naturalHeight);
    const issue = minEdge < LINK_THUMB_MIN_EDGE ? "dimensions" : null;
    revokeImageObjectUrl(img);
    return issue;
  } catch {
    return "type";
  }
}

export type CropTransform = {
  /** Multiplier on top of cover scale (1 = just covers viewport). */
  scale: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Export a 16:9 JPEG from the visible viewport region (pan/zoom within frame).
 */
export async function exportCroppedLinkThumbnail(
  image: HTMLImageElement,
  viewportWidth: number,
  viewportHeight: number,
  transform: CropTransform,
  fileName = "link-thumbnail.jpg",
): Promise<File> {
  const coverScale =
    Math.max(
      viewportWidth / image.naturalWidth,
      viewportHeight / image.naturalHeight,
    ) * transform.scale;

  const drawW = image.naturalWidth * coverScale;
  const drawH = image.naturalHeight * coverScale;
  const drawX = (viewportWidth - drawW) / 2 + transform.offsetX;
  const drawY = (viewportHeight - drawH) / 2 + transform.offsetY;

  let sx = (0 - drawX) / coverScale;
  let sy = (0 - drawY) / coverScale;
  let sw = viewportWidth / coverScale;
  let sh = viewportHeight / coverScale;

  sx = Math.max(0, Math.min(sx, image.naturalWidth - 1));
  sy = Math.max(0, Math.min(sy, image.naturalHeight - 1));
  sw = Math.min(sw, image.naturalWidth - sx);
  sh = Math.min(sh, image.naturalHeight - sy);

  const canvas = document.createElement("canvas");
  canvas.width = LINK_THUMB_OUTPUT_WIDTH;
  canvas.height = LINK_THUMB_OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");

  ctx.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    LINK_THUMB_OUTPUT_WIDTH,
    LINK_THUMB_OUTPUT_HEIGHT,
  );

  let quality = 0.88;
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > LINK_THUMB_MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }
  if (blob.size > LINK_THUMB_MAX_BYTES) {
    throw new Error("too_large");
  }

  return new File([blob], fileName, { type: "image/jpeg" });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("encode_failed"))),
      "image/jpeg",
      quality,
    );
  });
}
