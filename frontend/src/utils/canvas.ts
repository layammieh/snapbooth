import { FilterType, AdjustmentSettings, StickerItem, LayoutType, PrintSettings } from '../types';

// Build CSS filter string from filter type and adjustments
export function buildCSSFilter(filter: FilterType, adj: AdjustmentSettings): string {
  const base = `brightness(${adj.brightness / 100}) saturate(${adj.saturation / 100}) contrast(${adj.contrast / 100}) blur(${adj.blur}px)`;

  const filterMap: Record<FilterType, string> = {
    original: base,
    bw: `${base} grayscale(1)`,
    sepia: `${base} sepia(0.8)`,
    vintage: `${base} sepia(0.4) saturate(0.8) brightness(0.9)`,
    warm: `${base} sepia(0.2) saturate(1.3)`,
    cool: `${base} hue-rotate(180deg) saturate(0.9)`,
    softglow: `${base} brightness(1.1) contrast(0.9) saturate(1.1)`,
    retro: `${base} sepia(0.5) saturate(1.3) hue-rotate(-15deg) contrast(0.9)`,
    film: `${base} contrast(1.1) saturate(0.8) sepia(0.15)`,
    dreamy: `${base} brightness(1.1) saturate(0.8) blur(0.5px)`,
    bright: `${base} brightness(1.3) saturate(1.1) contrast(0.9)`,
    contrast: `${base} contrast(1.4) saturate(1.1)`,
  };

  return filterMap[filter] || base;
}

// Apply filter to canvas context
export function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  filter: FilterType,
  adj: AdjustmentSettings
): void {
  ctx.filter = buildCSSFilter(filter, adj);
}

// Reset canvas filter
export function resetCanvasFilter(ctx: CanvasRenderingContext2D): void {
  ctx.filter = 'none';
}

// Get pixel dimensions from print settings - always portrait for photobooth strips
export function getPrintPixels(settings: PrintSettings, layout?: LayoutType): { width: number; height: number } {
  let widthIn: number;
  let heightIn: number;

  switch (settings.unit) {
    case 'cm':
      widthIn = settings.width / 2.54;
      heightIn = settings.height / 2.54;
      break;
    case 'mm':
      widthIn = settings.width / 25.4;
      heightIn = settings.height / 25.4;
      break;
    default: // in
      widthIn = settings.width;
      heightIn = settings.height;
  }

  // Base portrait dimensions (width < height)
  let w = Math.min(widthIn, heightIn);
  let h = Math.max(widthIn, heightIn);

  // If specific photostrip layout (2x6" or 1:3 ratio)
  if (layout === '4strip' || layout === '3strip' || layout === '2v') {
    w = 2; // standard 2x6 strip
    h = 6;
  } else if (layout === '6grid' || layout === '4grid') {
    w = 4;
    h = 6;
  }

  const finalWidth = Math.round(w * settings.dpi);
  const finalHeight = Math.round(h * settings.dpi);

  return { width: finalWidth, height: finalHeight };
}

// Get layout columns/rows
export function getLayoutGrid(layout: LayoutType): { cols: number; rows: number } {
  const map: Record<LayoutType, { cols: number; rows: number }> = {
    single:   { cols: 1, rows: 1 },
    '2h':     { cols: 2, rows: 1 },
    '2v':     { cols: 1, rows: 2 },
    '3strip': { cols: 1, rows: 3 },
    '4strip': { cols: 1, rows: 4 },
    '4grid':  { cols: 2, rows: 2 },
    '6grid':  { cols: 2, rows: 3 },
    custom:   { cols: 2, rows: 2 },
  };
  return map[layout] || { cols: 1, rows: 1 };
}

export function getPhotoCountForLayout(layout: LayoutType): number {
  const map: Record<LayoutType, number> = {
    single:   1,
    '2h':     2,
    '2v':     2,
    '3strip': 3,
    '4strip': 4,
    '4grid':  4,
    '6grid':  6,
    custom:   4,
  };
  return map[layout] || 1;
}

// Main export function: render layout to canvas
export async function renderPhotoStrip(
  photos: string[], // data URLs
  layout: LayoutType,
  filter: FilterType,
  adjustments: AdjustmentSettings,
  stickers: StickerItem[],
  background: string,
  borderWidth: number,
  borderColor: string,
  printPixels: { width: number; height: number },
  footerText: string = ''
): Promise<string> {
  const canvas = document.createElement('canvas');
  const { cols, rows } = getLayoutGrid(layout);
  const gap = Math.round(printPixels.width * 0.025);
  const border = borderWidth;

  canvas.width = printPixels.width;
  canvas.height = printPixels.height;

  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  if (border > 0) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = border;
    ctx.strokeRect(border / 2, border / 2, canvas.width - border, canvas.height - border);
  }

  // Reserve space at bottom for text and date
  const bottomSpace = Math.round(canvas.height * 0.11);
  const innerW = canvas.width - gap * 2 - border * 2;
  const innerH = canvas.height - gap * 2 - border * 2 - bottomSpace;
  const cellW = (innerW - gap * (cols - 1)) / cols;
  const cellH = (innerH - gap * (rows - 1)) / rows;

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  for (let i = 0; i < Math.min(photos.length, cols * rows); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gap + border + col * (cellW + gap);
    const y = gap + border + row * (cellH + gap);

    try {
      const img = await loadImage(photos[i]);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 4);
      ctx.clip();
      applyCanvasFilter(ctx, filter, adjustments);

      // Cover fit
      const imgAspect = img.width / img.height;
      const cellAspect = cellW / cellH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imgAspect > cellAspect) {
        sw = img.height * cellAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / cellAspect;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
      resetCanvasFilter(ctx);
      ctx.restore();
    } catch (e) {
      // Placeholder
      ctx.fillStyle = '#f0e8ec';
      ctx.fillRect(x, y, cellW, cellH);
    }
  }

  // Draw stickers
  for (const sticker of stickers) {
    ctx.save();
    const sx = (sticker.x / 100) * canvas.width;
    const sy = (sticker.y / 100) * canvas.height;
    ctx.translate(sx, sy);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    const scale = sticker.scale || 1;
    ctx.scale(scale, scale);

    if (sticker.type === 'text') {
      ctx.font = `${sticker.fontSize || 24}px ${sticker.fontFamily || 'DM Sans'}`;
      ctx.fillStyle = sticker.color || '#51413B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.content, 0, 0);
    } else {
      const size = (sticker.width || 40) * (printPixels.width / 400);
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.content, 0, 0);
    }
    ctx.restore();
  }

  // Draw Bottom Space: User Text and Small Date on Bottom Right
  const footerY = canvas.height - bottomSpace / 2;
  
  // Date stamp (bottom right)
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const dateFontSize = Math.max(14, Math.round(canvas.width * 0.032));
  ctx.save();
  ctx.font = `600 ${dateFontSize}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = background.toLowerCase() === '#000000' || background.toLowerCase() === '#1a1a2e' ? '#A09895' : '#8C7B75';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(dateStr, canvas.width - gap - border - 8, canvas.height - bottomSpace * 0.28);
  ctx.restore();

  // User custom message (center of footer)
  if (footerText && footerText.trim()) {
    const textFontSize = Math.max(18, Math.round(canvas.width * 0.052));
    const isDark = background.toLowerCase() === '#000000' || background.toLowerCase() === '#1a1a2e';
    const mainColor = isDark ? '#FFFFFF' : '#51413B';
    const pinkColor = '#D4A0B5';
    const textY = canvas.height - bottomSpace * 0.65;

    ctx.save();
    ctx.font = `700 ${textFontSize}px 'Playfair Display', Georgia, serif`;
    ctx.textBaseline = 'middle';

    const trimmed = footerText.trim();
    if (trimmed.toLowerCase() === 'snapbooth') {
      const snapPart = trimmed.slice(0, 4);
      const boothPart = trimmed.slice(4);
      const snapWidth = ctx.measureText(snapPart).width;
      const boothWidth = ctx.measureText(boothPart).width;
      const totalWidth = snapWidth + boothWidth;
      const startX = (canvas.width - totalWidth) / 2;

      ctx.textAlign = 'left';
      ctx.fillStyle = mainColor;
      ctx.fillText(snapPart, startX, textY);
      ctx.fillStyle = pinkColor;
      ctx.fillText(boothPart, startX + snapWidth, textY);
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = mainColor;
      ctx.fillText(trimmed, canvas.width / 2, textY);
    }
    ctx.restore();
  }

  return canvas.toDataURL('image/png', 1.0);
}

// Download helper
export function downloadCanvas(dataUrl: string, filename: string, format: 'png' | 'jpeg' = 'png'): void {
  const link = document.createElement('a');
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  
  if (format === 'jpeg') {
    // Convert to JPEG
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      link.href = canvas.toDataURL(mimeType, 0.92);
      link.download = filename;
      link.click();
    };
    img.src = dataUrl;
  } else {
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }
}
