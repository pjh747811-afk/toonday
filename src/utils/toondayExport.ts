import { ViewerPanel } from '../data/toondayData';

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split('');
  const lines: string[] = [];
  let current = '';
  for (const ch of words) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), 2200);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

function resolveBgColors(bgNameOrColor: string): [string, string] {
  const lower = bgNameOrColor.toLowerCase();
  if (lower.includes('퍼플') || lower.includes('7c3aed')) return ['#7C3AED', '#C084FC'];
  if (lower.includes('네이비') || lower.includes('1e1b4b')) return ['#1E1B4B', '#312E81'];
  if (lower.includes('코랄') || lower.includes('f43f5e')) return ['#F43F5E', '#FDA4AF'];
  if (lower.includes('블랙') || lower.includes('0f172a')) return ['#0F172A', '#1E293B'];
  if (lower.includes('핑크') || lower.includes('ec4899')) return ['#EC4899', '#F9A8D4'];
  if (lower.includes('앰버') || lower.includes('f59e0b')) return ['#F59E0B', '#FCD34D'];
  if (lower.includes('화이트') || lower.includes('ffffff')) return ['#FFF8FA', '#F3EEFF'];
  if (lower.includes('드림') || lower.includes('a18cd1')) return ['#A18CD1', '#FBC2EB'];
  return ['#FF5376', '#FED2A4'];
}

function triggerDownloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function exportWebtoonImage(opts: {
  episodeTitle: string;
  panels: ViewerPanel[];
  format: 'story' | 'feed' | 'scroll';
  bgColor?: string;
  includeStamp?: boolean;
  removeWatermark?: boolean;
  tags?: string[];
}): Promise<'downloaded'> {
  const {
    episodeTitle,
    panels,
    format,
    bgColor = '인스타 선셋',
    includeStamp = true,
    removeWatermark = false,
    tags = ['#ToonDay', '#일상웹툰'],
  } = opts;

  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = format === 'story' ? 1920 : format === 'feed' ? 1080 : 2160;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const [c1, c2] = resolveBgColors(bgColor);
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const isLightBg = c1 === '#FFF8FA';
  const titleColor = isLightBg ? '#1F1A24' : '#FFFFFF';

  // Header badge & title
  ctx.fillStyle = isLightBg ? 'rgba(255,83,118,0.12)' : 'rgba(255,255,255,0.22)';
  drawRoundedRect(ctx, 64, 56, 220, 44, 22);
  ctx.fill();
  ctx.fillStyle = titleColor;
  ctx.font = '700 22px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
  ctx.fillText('ToonDay 4컷 웹툰', 88, 86);

  ctx.font = '800 40px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
  ctx.fillStyle = titleColor;
  ctx.fillText(episodeTitle.slice(0, 26), 64, 152);

  const visiblePanels = panels.slice(0, 4);
  const loadedImgs = await Promise.all(visiblePanels.map((p) => loadImageSafe(p.image)));

  const panelPastels = ['#FFE5EC', '#FFF3DF', '#E6FAF0', '#E5F5FF'];

  if (format === 'scroll') {
    const cardW = width - 128;
    const cardH = 440;
    for (let i = 0; i < visiblePanels.length; i++) {
      const p = visiblePanels[i];
      const y = 200 + i * (cardH + 28);
      ctx.fillStyle = '#FFFFFF';
      drawRoundedRect(ctx, 64, y, cardW, cardH, 28);
      ctx.fill();

      ctx.save();
      drawRoundedRect(ctx, 84, y + 20, 380, cardH - 40, 20);
      ctx.clip();
      const img = loadedImgs[i];
      if (img) {
        ctx.drawImage(img, 84, y + 20, 380, cardH - 40);
      } else {
        ctx.fillStyle = panelPastels[i % 4];
        ctx.fillRect(84, y + 20, 380, cardH - 40);
      }
      ctx.restore();

      if (includeStamp) {
        ctx.fillStyle = '#FF5376';
        ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${p.cutLabel} · ${p.timeLabel}`, 492, y + 66);
      }

      ctx.fillStyle = '#1F1A24';
      ctx.font = '700 30px "Noto Sans KR", sans-serif';
      const lines = wrapCanvasText(ctx, p.dialogue, cardW - 460);
      lines.slice(0, 4).forEach((ln, li) => {
        ctx.fillText(ln, 492, y + 130 + li * 42);
      });

      if (p.sfx) {
        ctx.fillStyle = '#E11D48';
        ctx.font = '900 34px "Noto Sans KR", sans-serif';
        ctx.fillText(p.sfx, 492, y + cardH - 50);
      }
    }
  } else {
    // 2x2 grid for story (9:16) or feed (1:1)
    const gridTop = format === 'story' ? 210 : 190;
    const gridBottomPadding = format === 'story' ? 190 : 110;
    const availH = height - gridTop - gridBottomPadding;
    const gap = 24;
    const cellW = (width - 128 - gap) / 2;
    const cellH = (availH - gap) / 2;

    for (let i = 0; i < visiblePanels.length; i++) {
      const p = visiblePanels[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 64 + col * (cellW + gap);
      const y = gridTop + row * (cellH + gap);

      ctx.fillStyle = '#FFFFFF';
      drawRoundedRect(ctx, x, y, cellW, cellH, 26);
      ctx.fill();

      ctx.save();
      drawRoundedRect(ctx, x + 14, y + 14, cellW - 28, cellH - 120, 18);
      ctx.clip();
      const img = loadedImgs[i];
      if (img) {
        ctx.drawImage(img, x + 14, y + 14, cellW - 28, cellH - 120);
      } else {
        ctx.fillStyle = panelPastels[i % 4];
        ctx.fillRect(x + 14, y + 14, cellW - 28, cellH - 120);
      }
      ctx.restore();

      if (includeStamp) {
        ctx.fillStyle = 'rgba(20, 20, 30, 0.72)';
        drawRoundedRect(ctx, x + 24, y + 24, 150, 34, 17);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(p.cutLabel, x + 38, y + 47);
      }

      ctx.fillStyle = '#1F1A24';
      ctx.font = '700 23px "Noto Sans KR", sans-serif';
      const lines = wrapCanvasText(ctx, p.dialogue, cellW - 36);
      lines.slice(0, 2).forEach((ln, li) => {
        ctx.fillText(ln, x + 18, y + cellH - 64 + li * 30);
      });
    }
  }

  // Tags footer
  ctx.fillStyle = titleColor;
  ctx.font = '700 24px "Noto Sans KR", sans-serif';
  ctx.fillText(tags.join('  '), 64, height - 64);

  if (!removeWatermark) {
    ctx.fillStyle = isLightBg ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Created with ToonDay AI', width - 320, height - 64);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Blob failed'))),
        'image/png'
      );
    } catch {
      // Fallback clean card without external tainted images if browser blocks crossOrigin
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 40px sans-serif';
      ctx.fillText(episodeTitle, 64, 140);
      visiblePanels.forEach((p, idx) => {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        drawRoundedRect(ctx, 64, 210 + idx * 195, width - 128, 170, 24);
        ctx.fill();
        ctx.fillStyle = '#1F1A24';
        ctx.font = '700 26px sans-serif';
        ctx.fillText(`${p.cutLabel}: ${p.dialogue}`, 96, 290 + idx * 195);
      });
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Fallback blob failed'))),
        'image/png'
      );
    }
  });

  const safeSlug = episodeTitle.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 24) || 'episode';
  triggerDownloadBlob(blob, `toonday_${format}_${safeSlug}.png`);
  return 'downloaded';
}

export async function exportPhotocardImage(opts: {
  episodeTitle: string;
  panel: ViewerPanel;
  author: string;
}): Promise<'downloaded'> {
  const { episodeTitle, panel, author } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const grad = ctx.createLinearGradient(0, 0, 900, 1350);
  grad.addColorStop(0, '#FFE0E8');
  grad.addColorStop(0.5, '#FFF5E1');
  grad.addColorStop(1, '#DFF6FF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 900, 1350);

  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, 48, 48, 804, 1254, 42);
  ctx.fill();

  const img = await loadImageSafe(panel.image);
  ctx.save();
  drawRoundedRect(ctx, 84, 84, 732, 860, 28);
  ctx.clip();
  if (img) {
    ctx.drawImage(img, 84, 84, 732, 860);
  } else {
    ctx.fillStyle = '#FFEBF0';
    ctx.fillRect(84, 84, 732, 860);
  }
  ctx.restore();

  ctx.fillStyle = '#FF5376';
  ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`TOONDAY COLLECTOR CARD · ${panel.cutLabel}`, 84, 1010);

  ctx.fillStyle = '#1F1A24';
  ctx.font = '800 34px "Noto Sans KR", sans-serif';
  ctx.fillText(episodeTitle.slice(0, 22), 84, 1068);

  ctx.fillStyle = '#4B4453';
  ctx.font = '700 28px "Noto Sans KR", sans-serif';
  const lines = wrapCanvasText(ctx, `"${panel.dialogue}"`, 730);
  lines.slice(0, 2).forEach((ln, idx) => {
    ctx.fillText(ln, 84, 1132 + idx * 42);
  });

  ctx.fillStyle = '#7A7582';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Author ${author} · Limited Edition`, 84, 1255);

  const blob = await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Blob failed'))), 'image/png');
    } catch {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 900, 1350);
      ctx.fillStyle = '#FF5376';
      ctx.font = '800 38px sans-serif';
      ctx.fillText(episodeTitle, 84, 240);
      ctx.fillStyle = '#1F1A24';
      ctx.font = '700 28px sans-serif';
      ctx.fillText(panel.dialogue, 84, 340);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Fallback blob failed'))), 'image/png');
    }
  });

  triggerDownloadBlob(blob, `toonday_photocard_${panel.cutLabel.replace(/\s+/g, '_')}.png`);
  return 'downloaded';
}

export async function shareOrCopyText(opts: {
  title: string;
  text: string;
  url?: string;
}): Promise<'shared' | 'copied'> {
  const shareUrl = opts.url || window.location.href;
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        url: shareUrl,
      });
      return 'shared';
    } catch {
      // User canceled or iframe restricted navigator.share -> fallback to clipboard
    }
  }
  const formatted = `${opts.title}\n${opts.text}\n${shareUrl}`;
  await navigator.clipboard?.writeText(formatted).catch(() => {});
  return 'copied';
}
