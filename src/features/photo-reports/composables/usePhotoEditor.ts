import { ref, computed } from "vue";
import type { Canvas } from "fabric";

export type EditorMode = "select" | "blur" | "mosaic";
export type BrushShape = "circle" | "square";

const MAX_UNDO = 20;

type EditorViewport = {
  maxWidth: number;
  maxHeight: number;
};

/**
 * In dev mode, external storage images can't be loaded onto <canvas> due to CORS.
 * We proxy them through the Vite dev server which adds the necessary headers.
 */
// TODO: refactor - this composable is coupled to a Vite-only proxy contract, which makes it non-portable compared to shared project composables.
function resolveCanvasUrl(url: string): string {
  if (!import.meta.env.DEV) return url;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  try {
    const u = new URL(url);
    if (u.origin === window.location.origin) return url;
    return `/__img_proxy__${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

function hexToRgba(color: string, alpha: number): string {
  const normalized = color.trim().replace("#", "");
  if (![3, 6].includes(normalized.length)) {
    return `rgba(255,255,255,${alpha})`;
  }

  const hex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : normalized;

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  if ([red, green, blue].some((channel) => Number.isNaN(channel))) {
    return `rgba(255,255,255,${alpha})`;
  }

  return `rgba(${red},${green},${blue},${alpha})`;
}

function getBrushPreviewColor(mode: EditorMode): string {
  const styles = getComputedStyle(document.documentElement);
  const colorVar = mode === "blur" ? "--color-primary" : "--color-secondary";
  const fallback = mode === "blur" ? "#8e99f3" : "#fc6b40";
  const resolved = styles.getPropertyValue(colorVar).trim() || fallback;

  return hexToRgba(resolved, 0.25);
}

export function usePhotoEditor() {
  const isReady = ref(false);
  const currentMode = ref<EditorMode>("select");
  const brushSize = ref(30);
  const brushShape = ref<BrushShape>("circle");

  let canvas: Canvas | null = null;
  let resolvedImageUrl = "";
  const undoStack = ref<string[]>([]);
  let baseCanvasW = 0;
  let baseCanvasH = 0;

  const canUndo = computed(() => undoStack.value.length > 0);

  // ─── Init ────────────────────────────────────────────────────────────────

  async function initCanvas(
    el: HTMLCanvasElement,
    imageUrl: string,
    viewport?: EditorViewport,
  ): Promise<void> {
    const {
      Canvas: FabricCanvas,
      PencilBrush,
      FabricImage,
    } = await import("fabric");

    resolvedImageUrl = resolveCanvasUrl(imageUrl);
    undoStack.value = [];

    canvas = new FabricCanvas(el, { preserveObjectStacking: true });

    const img = await FabricImage.fromURL(resolvedImageUrl, {
      crossOrigin: "anonymous",
    });
    if (!img || img.width === 0) {
      throw new Error("Failed to load image");
    }

    const maxWidth = viewport?.maxWidth ?? img.width;
    const maxHeight = viewport?.maxHeight ?? img.height;
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
    const canvasW = Math.round(img.width * scale);
    const canvasH = Math.round(img.height * scale);

    canvas.setDimensions({ width: canvasW, height: canvasH });
    baseCanvasW = canvasW;
    baseCanvasH = canvasH;
    img.set({ originX: "left", originY: "top", scaleX: scale, scaleY: scale });
    canvas.backgroundImage = img;

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    _applyBrushSettings();

    canvas.on("path:created", _handlePathCreated);

    isReady.value = true;
  }

  function dispose(): void {
    if (!canvas) return;
    try {
      canvas.off("path:created", _handlePathCreated);
      canvas.dispose();
    } catch {
      // ignore dispose errors
    }
    canvas = null;
    undoStack.value = [];
    baseCanvasW = 0;
    baseCanvasH = 0;
    isReady.value = false;
  }

  // ─── Mode ────────────────────────────────────────────────────────────────

  function setZoom(level: number): void {
    if (!canvas) return;
    canvas.setZoom(level);
    canvas.setDimensions({
      width: baseCanvasW * level,
      height: baseCanvasH * level,
    });
  }

  function setMode(mode: EditorMode): void {
    currentMode.value = mode;
    if (!canvas) return;

    if (mode === "select") {
      canvas.isDrawingMode = false;
    } else {
      canvas.isDrawingMode = true;
      canvas.freeDrawingCursor = "crosshair";
      _applyBrushSettings();
    }
  }

  // ─── Brush ───────────────────────────────────────────────────────────────

  function setBrushSize(size: number): void {
    brushSize.value = size;
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = size;
    }
  }

  function setBrushShape(shape: BrushShape): void {
    brushShape.value = shape;
    if (canvas?.freeDrawingBrush) {
      const isRound = shape === "circle";
      canvas.freeDrawingBrush.strokeLineCap = isRound ? "round" : "square";
      canvas.freeDrawingBrush.strokeLineJoin = isRound ? "round" : "miter";
    }
  }

  function _applyBrushSettings(): void {
    if (!canvas?.freeDrawingBrush) return;
    const brush = canvas.freeDrawingBrush;
    brush.width = brushSize.value;
    brush.color = getBrushPreviewColor(currentMode.value);
    const isRound = brushShape.value === "circle";
    brush.strokeLineCap = isRound ? "round" : "square";
    brush.strokeLineJoin = isRound ? "round" : "miter";
  }

  // ─── Undo ────────────────────────────────────────────────────────────────

  function _saveState(): void {
    if (!canvas) return;
    if (undoStack.value.length >= MAX_UNDO) undoStack.value.shift();
    undoStack.value.push(JSON.stringify(canvas.toJSON()));
  }

  async function undo(): Promise<void> {
    if (!canvas || undoStack.value.length === 0) return;
    const state = undoStack.value.pop()!;
    canvas.renderOnAddRemove = false;
    await canvas.loadFromJSON(state);
    canvas.renderOnAddRemove = true;
    canvas.renderAll();
  }

  // ─── Path created — apply blur / mosaic ──────────────────────────────────

  async function _handlePathCreated(e: { path: unknown }): Promise<void> {
    if (currentMode.value !== "blur" && currentMode.value !== "mosaic") return;
    if (!canvas) return;

    const {
      StaticCanvas,
      FabricImage: FabricImg,
      filters,
    } = await import("fabric");

    const drawnPath = e.path as Parameters<typeof canvas.remove>[0];
    canvas.remove(drawnPath);
    _saveState();

    // 1. Render path as opaque mask on a temp static canvas.
    // Use base (unzoomed) dimensions — path coords are already in canvas space
    // because Fabric's PencilBrush applies the inverse viewport transform.
    const pathForMask = drawnPath as Parameters<
      InstanceType<typeof StaticCanvas>["add"]
    >[0];
    (pathForMask as { set: (opts: object) => void }).set({
      stroke: "#000000",
      opacity: 1,
    });
    const maskSc = new StaticCanvas(undefined, {
      width: baseCanvasW,
      height: baseCanvasH,
    });
    maskSc.add(pathForMask);
    maskSc.renderAll();
    const maskDataUrl = maskSc.toDataURL();
    maskSc.dispose();

    // 2. Load mask as FabricImage
    const maskImg = await FabricImg.fromURL(maskDataUrl);
    maskImg.set({ left: 0, top: 0, originX: "left", originY: "top" });

    // 3. Load original image via resolved (proxied) URL, apply effect + mask blend
    const srcImg = await FabricImg.fromURL(resolvedImageUrl, {
      crossOrigin: "anonymous",
    });
    if (!srcImg || !canvas) return;

    const effectFilter =
      currentMode.value === "blur"
        ? new filters.Blur({ blur: Math.min(0.25, brushSize.value / 150) })
        : new filters.Pixelate({
            blocksize: Math.max(5, Math.round(brushSize.value / 5)),
          });

    srcImg.filters = [
      effectFilter,
      new filters.BlendImage({ image: maskImg, mode: "mask" }),
    ];
    srcImg.applyFilters();

    srcImg.set({
      left: 0,
      top: 0,
      originX: "left",
      originY: "top",
      scaleX: baseCanvasW / (srcImg.width ?? 1),
      scaleY: baseCanvasH / (srcImg.height ?? 1),
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
    });

    canvas.add(srcImg);
    canvas.renderAll();
  }

  // ─── Export (always at full original resolution) ─────────────────────────

  async function getResultBlob(): Promise<Blob> {
    if (!canvas) throw new Error("Canvas not initialized");

    const { Canvas: FabricCanvas, FabricImage: FabricImg } = await import(
      "fabric"
    );

    canvas.discardActiveObject();
    canvas.renderAll();

    // Re-render at original image resolution to avoid quality loss from scaling
    const origImg = await FabricImg.fromURL(resolvedImageUrl, {
      crossOrigin: "anonymous",
    });
    const origW = origImg.width ?? canvas.width;
    const origH = origImg.height ?? canvas.height;
    const scaleFactor = origW / canvas.width;

    const exportCanvas = new FabricCanvas(document.createElement("canvas"), {
      width: origW,
      height: origH,
    });

    const objects = canvas.getObjects();
    const json = JSON.stringify({
      objects: objects.map((o) => o.toJSON()),
    });

    await exportCanvas.loadFromJSON(json);

    origImg.set({ originX: "left", originY: "top" });
    exportCanvas.backgroundImage = origImg;

    // Scale all objects up to match original resolution
    exportCanvas.getObjects().forEach((obj) => {
      obj.scaleX = (obj.scaleX ?? 1) * scaleFactor;
      obj.scaleY = (obj.scaleY ?? 1) * scaleFactor;
      obj.left = (obj.left ?? 0) * scaleFactor;
      obj.top = (obj.top ?? 0) * scaleFactor;
      obj.setCoords();
    });

    exportCanvas.renderAll();

    const dataUrl = exportCanvas.toDataURL({
      multiplier: 1,
      format: "jpeg",
      quality: 1,
    });
    exportCanvas.dispose();

    const res = await fetch(dataUrl);
    return res.blob();
  }

  return {
    isReady,
    currentMode,
    brushSize,
    brushShape,
    canUndo,
    initCanvas,
    dispose,
    setZoom,
    setMode,
    setBrushSize,
    setBrushShape,
    undo,
    getResultBlob,
  };
}
