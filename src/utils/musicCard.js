/** @format
 * flenzo Music Bot — Music Card (Canvas)
 * Developer: Yadav
 * Unique design — different from Destroic
 */

const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const path = require("path");

// Register fonts
try {
  GlobalFonts.registerFromPath(path.join(process.cwd(), "assets/fonts/bold.ttf"), "flenzoBold");
  GlobalFonts.registerFromPath(path.join(process.cwd(), "assets/fonts/regular.ttf"), "flenzoRegular");
} catch {}

// ── Color helpers ─────────────────────────────────────────────────────────────
const getDominant = (ctx, w, h) => {
  const d = ctx.getImageData(0, 0, w, h).data;
  const map = {};
  for (let i = 0; i < d.length; i += 16) {
    const a = d[i + 3];
    if (a < 128) continue;
    const r = Math.round(d[i] / 15) * 15;
    const g = Math.round(d[i + 1] / 15) * 15;
    const b = Math.round(d[i + 2] / 15) * 15;
    const k = `${r},${g},${b}`;
    map[k] = (map[k] || 0) + 1;
  }
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return { r: 88, g: 101, b: 242 };
  const [r, g, b] = sorted[0][0].split(",").map(Number);
  return { r, g, b };
};

const brighten = (c, amt) => ({
  r: Math.min(255, c.r + amt),
  g: Math.min(255, c.g + amt),
  b: Math.min(255, c.b + amt),
});

const darken = (c, amt) => ({
  r: Math.max(0, c.r - amt),
  g: Math.max(0, c.g - amt),
  b: Math.max(0, c.b - amt),
});

const rgba = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;
const isLight = (c) => (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) > 160;

// ── Draw helpers ──────────────────────────────────────────────────────────────
const rrect = (ctx, x, y, w, h, r) => {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// Draw waveform bars (decorative)
const drawWave = (ctx, x, y, w, h, accent, count = 40) => {
  ctx.save();
  ctx.globalAlpha = 0.5;
  const barW = (w / count) * 0.6;
  const gap  = (w / count) * 0.4;
  for (let i = 0; i < count; i++) {
    const barH = (Math.abs(Math.sin(i * 0.4) * 0.5 + Math.cos(i * 0.2) * 0.3) + 0.15) * h;
    const bx   = x + i * (barW + gap);
    const by   = y + h - barH;
    const grad = ctx.createLinearGradient(0, by, 0, by + barH);
    grad.addColorStop(0, rgba(brighten(accent, 80), 0.9));
    grad.addColorStop(1, rgba(accent, 0.2));
    ctx.fillStyle = grad;
    rrect(ctx, bx, by, barW, barH, 3);
    ctx.fill();
  }
  ctx.restore();
};

// Draw floating particles
const drawParticles = (ctx, W, H, accent) => {
  ctx.save();
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(brighten(accent, 100), Math.random() * 0.4 + 0.1);
    ctx.fill();
  }
  ctx.restore();
};

// ── Main card generator ───────────────────────────────────────────────────────
module.exports = async function generateMusicCard(data) {
  const { title, author, duration, thumbnail, progress, source, requester } = data;

  const W = 1100, H = 380;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d");

  // ── Dominant color from thumbnail ──────────────────────────────────────────
  let accent = { r: 88, g: 101, b: 242 }; // flenzo purple default
  let thumbImg = null;

  try {
    thumbImg = await loadImage(thumbnail);
    const tmp = createCanvas(60, 60);
    const tx  = tmp.getContext("2d");
    tx.drawImage(thumbImg, 0, 0, 60, 60);
    accent = getDominant(tx, 60, 60);
  } catch {}

  const dark      = darken(accent, 55);
  const mid       = darken(accent, 35);
  const textColor = isLight(accent) ? "#1a1a1a" : "#ffffff";

  // ── 1. Rounded canvas clip ─────────────────────────────────────────────────
  ctx.save();
  rrect(ctx, 0, 0, W, H, 22);
  ctx.clip();

  // ── 2. Background — split layout ──────────────────────────────────────────
  // Left dark panel
  const bgLeft = ctx.createLinearGradient(0, 0, W * 0.42, H);
  bgLeft.addColorStop(0, rgba(darken(dark, 20), 1));
  bgLeft.addColorStop(1, rgba(dark, 1));
  ctx.fillStyle = bgLeft;
  ctx.fillRect(0, 0, W * 0.42, H);

  // Right accent panel
  const bgRight = ctx.createLinearGradient(W * 0.42, 0, W, H);
  bgRight.addColorStop(0, rgba(mid, 1));
  bgRight.addColorStop(1, rgba(darken(mid, 20), 1));
  ctx.fillStyle = bgRight;
  ctx.fillRect(W * 0.42, 0, W * 0.58, H);

  // ── 3. Diagonal separator ─────────────────────────────────────────────────
  ctx.save();
  const diagGrad = ctx.createLinearGradient(W * 0.38, 0, W * 0.48, H);
  diagGrad.addColorStop(0, rgba(accent, 0.4));
  diagGrad.addColorStop(1, rgba(brighten(accent, 60), 0.2));
  ctx.fillStyle = diagGrad;
  ctx.beginPath();
  ctx.moveTo(W * 0.40, 0);
  ctx.lineTo(W * 0.46, 0);
  ctx.lineTo(W * 0.42, H);
  ctx.lineTo(W * 0.36, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── 4. Particles + wave ────────────────────────────────────────────────────
  drawParticles(ctx, W, H, accent);
  drawWave(ctx, W * 0.46, H * 0.55, W * 0.52, H * 0.3, accent);

  // ── 5. Album art (left, rounded square with glow) ─────────────────────────
  const thumbX = 30, thumbY = (H - 280) / 2, thumbS = 280;

  // glow
  ctx.save();
  ctx.shadowColor = rgba(accent, 0.7);
  ctx.shadowBlur  = 30;
  ctx.beginPath();
  ctx.arc(thumbX + thumbS / 2, thumbY + thumbS / 2, thumbS / 2 + 6, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(brighten(accent, 80), 0.5);
  ctx.lineWidth   = 3;
  ctx.stroke();
  ctx.restore();

  // album clip + draw
  ctx.save();
  rrect(ctx, thumbX, thumbY, thumbS, thumbS, 18);
  ctx.clip();
  if (thumbImg) {
    ctx.drawImage(thumbImg, thumbX, thumbY, thumbS, thumbS);
  } else {
    ctx.fillStyle = rgba(mid, 1);
    ctx.fillRect(thumbX, thumbY, thumbS, thumbS);
    ctx.fillStyle = rgba(brighten(accent, 100), 0.5);
    ctx.font = "100px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎵", thumbX + thumbS / 2, thumbY + thumbS / 2);
  }
  ctx.restore();

  // Source badge on album art
  const srcLabel = (source || "MUSIC").toUpperCase().slice(0, 10);
  ctx.save();
  const badgeW = ctx.measureText(srcLabel).width + 24;
  rrect(ctx, thumbX + thumbS - badgeW - 8, thumbY + 8, badgeW, 26, 6);
  ctx.fillStyle = rgba(darken(dark, 10), 0.85);
  ctx.fill();
  ctx.font = "bold 14px flenzoRegular, sans-serif";
  ctx.fillStyle = rgba(brighten(accent, 120), 0.95);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(srcLabel, thumbX + thumbS - badgeW / 2 - 8, thumbY + 21);
  ctx.restore();

  // ── 6. Text section (right) ───────────────────────────────────────────────
  const tx2 = W * 0.47;
  let ty = 58;

  // Brand name top right
  ctx.save();
  ctx.font = "bold 18px flenzoBold, sans-serif";
  ctx.fillStyle = rgba(brighten(accent, 140), 0.5);
  ctx.textAlign = "right";
  ctx.fillText("flenzo MUSIC", W - 28, 28);
  ctx.restore();

  // Title
  ctx.save();
  ctx.font = `bold 44px flenzoBold, sans-serif`;
  ctx.textAlign = "left";
  const titleGrad = ctx.createLinearGradient(tx2, ty - 36, tx2 + 500, ty);
  titleGrad.addColorStop(0, "#ffffff");
  titleGrad.addColorStop(1, rgba(brighten(accent, 120), 0.9));
  ctx.fillStyle = titleGrad;
  ctx.shadowColor = rgba(accent, 0.5);
  ctx.shadowBlur  = 10;
  const shortTitle = title.length > 26 ? title.slice(0, 26) + "…" : title;
  ctx.fillText(shortTitle, tx2, ty);
  ctx.restore();
  ty += 50;

  // Author
  ctx.save();
  ctx.font = `30px flenzoRegular, sans-serif`;
  ctx.fillStyle = rgba(brighten(accent, 60), 0.8);
  ctx.textAlign = "left";
  const shortAuthor = author.length > 32 ? author.slice(0, 32) + "…" : author;
  ctx.fillText(shortAuthor, tx2, ty);
  ctx.restore();
  ty += 38;

  // Requester
  ctx.save();
  ctx.font = `22px flenzoRegular, sans-serif`;
  ctx.fillStyle = rgba(brighten(accent, 40), 0.55);
  ctx.textAlign = "left";
  const reqName = requester?.username ?? requester?.tag ?? "Unknown";
  ctx.fillText(`👤  ${reqName}`, tx2, ty);
  ctx.restore();
  ty += 48;

  // ── 7. Progress bar ────────────────────────────────────────────────────────
  const barX = tx2, barY = ty, barW = W - tx2 - 30, barH = 10;
  const filled = Math.max(0, Math.min(1, (progress || 0) / 100)) * barW;

  // Track bg
  ctx.save();
  rrect(ctx, barX, barY, barW, barH, 5);
  ctx.fillStyle = rgba(darken(dark, 10), 0.6);
  ctx.fill();
  ctx.restore();

  // Fill
  const barGrad = ctx.createLinearGradient(barX, 0, barX + filled, 0);
  barGrad.addColorStop(0, rgba(accent, 0.9));
  barGrad.addColorStop(1, rgba(brighten(accent, 100), 1));
  ctx.save();
  rrect(ctx, barX, barY, filled, barH, 5);
  ctx.fillStyle = barGrad;
  ctx.shadowColor = rgba(brighten(accent, 80), 0.8);
  ctx.shadowBlur  = 10;
  ctx.fill();
  ctx.restore();

  // Knob
  ctx.save();
  ctx.beginPath();
  ctx.arc(barX + filled, barY + barH / 2, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = rgba(accent, 1);
  ctx.shadowBlur  = 18;
  ctx.fill();
  ctx.restore();

  // Time labels
  ctx.save();
  ctx.font = "20px flenzoRegular, sans-serif";
  ctx.fillStyle = rgba(brighten(accent, 60), 0.55);
  ctx.textAlign = "left";
  ctx.fillText("0:00", barX, barY + 28);
  ctx.textAlign = "right";
  ctx.fillText(duration, barX + barW, barY + 28);
  ctx.restore();

  ctx.restore(); // end main clip

  const buffer     = canvas.toBuffer("image/png");
  const attachment = new AttachmentBuilder(buffer, { name: "flenzo-card.png" });
  return attachment;
};

