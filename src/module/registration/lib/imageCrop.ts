/**
 * @file src/module/registration/lib/imageCrop.ts
 * Geometry for the interactive photo cropper.
 *
 * The cropper used to letterbox the photo in the preview (`object-contain`)
 * while the output canvas centre-cropped it (`cover` fit) — so the saved file
 * never matched what the user framed. Both the preview and the canvas now
 * derive from the numbers below, which is what makes the crop WYSIWYG.
 */

/** Everything the preview and the output canvas need to agree on. */
export interface CropGeometry {
  /** Visible width of the crop box, in CSS pixels. */
  boxWidth: number
  /** Visible height of the crop box, in CSS pixels. */
  boxHeight: number
  /** Width the source image is drawn at, in CSS pixels (cover fit at zoom 1). */
  drawWidth: number
  /** Height the source image is drawn at, in CSS pixels. */
  drawHeight: number
  /** Source pixels per CSS pixel at zoom 1. */
  baseScale: number
}

/**
 * Cover fit — the smallest scale at which the source still covers the whole
 * crop box. One axis matches the box exactly, the other overflows.
 */
export function computeCropGeometry(
  sourceWidth: number,
  sourceHeight: number,
  boxWidth: number,
  boxHeight: number,
): CropGeometry {
  const baseScale = Math.max(boxWidth / sourceWidth, boxHeight / sourceHeight)

  return {
    boxWidth,
    boxHeight,
    baseScale,
    drawWidth: sourceWidth * baseScale,
    drawHeight: sourceHeight * baseScale,
  }
}

/**
 * Keeps the photo covering the crop box.
 *
 * The offset may never exceed half of the overhang, so dragging can never
 * pull the photo out of frame and leave a blank strip in the output.
 */
export function clampOffset(
  offset: { x: number; y: number },
  scaledWidth: number,
  scaledHeight: number,
  boxWidth: number,
  boxHeight: number,
): { x: number; y: number } {
  const maxX = Math.max(0, (scaledWidth - boxWidth) / 2)
  const maxY = Math.max(0, (scaledHeight - boxHeight) / 2)

  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  }
}

/**
 * Output canvas size for an aspect ratio (width / height) and a long edge.
 * A ratio of 1 is square; 0.75 is a 3:4 portrait.
 */
export function outputSizeFor(
  aspect: number,
  longEdge: number,
): { width: number; height: number } {
  return aspect >= 1
    ? { width: longEdge, height: Math.round(longEdge / aspect) }
    : { width: Math.round(longEdge * aspect), height: longEdge }
}

/** Crop box size for an aspect ratio, bounded by the longest edge. */
export function cropBoxSizeFor(
  aspect: number,
  longEdge: number,
): { width: number; height: number } {
  return aspect >= 1
    ? { width: longEdge, height: Math.round(longEdge / aspect) }
    : { width: Math.round(longEdge * aspect), height: longEdge }
}
