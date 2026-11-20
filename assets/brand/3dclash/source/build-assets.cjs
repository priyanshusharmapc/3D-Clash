/* 3DClash identity v2.0. Every logo export uses the paths in source/master.json, which
 * generate-master.py writes. Usage:
 *   CLASH3D_SUPPORT_FONT=/path/to/Inter-Regular.otf node source/build-assets.cjs [--deps /path/to/node_modules]
 * Requires sharp and @napi-rs/canvas. The support font sets the text in lockups and cards; text is
 * outlined to paths before it is written, so no font file is needed to view or use the outputs.
 */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ROOT = path.resolve(__dirname, '..');
const dependencyArg = process.argv.indexOf('--deps');
const req = dependencyArg >= 0 ? createRequire(path.resolve(process.argv[dependencyArg + 1], 'package.json')) : require;
const sharp = req('sharp');
const { convertSVGTextToPath, GlobalFonts } = req('@napi-rs/canvas');

const fontPath = process.env.CLASH3D_SUPPORT_FONT;
if (!fontPath || !fs.existsSync(fontPath)) {
  throw new Error('Set CLASH3D_SUPPORT_FONT to a sans-serif font file, for example Inter-Regular.otf');
}
GlobalFonts.registerFromPath(fontPath, '3DClash Support');

const masterFile = path.join(__dirname, 'master.json');
if (!fs.existsSync(masterFile)) throw new Error('Run source/generate-master.py first to write master.json');
const master = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
const palette = master.palette;
const WORDMARK_W = master.wordmark.width;   // 1396 in v2.0
const LOCKUP_W = WORDMARK_W + 128;          // 64 units of clear space each side

const d = commands => commands.map(p => p.join(' ')).join(' ');
const shapes = (name, colour = 'currentColor') => `<g fill="${colour}">${master[name].paths.map(p => `<path d="${d(p)}"/>`).join('')}</g>`;
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const font = '3DClash Support, Inter, Segoe UI, Arial, sans-serif';
const text = (x, y, size, value, fill = palette.ink, attrs = '') => `<text x="${x}" y="${y}" font-size="${size}" font-family="${font}" fill="${fill}" ${attrs}>${esc(value)}</text>`;
const rect = (x, y, w, h, fill, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const line = (x1, y1, x2, y2, colour = palette.line) => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${colour}"/>`;
const placed = (name, x, y, w, colour) => `<g transform="translate(${x} ${y}) scale(${w / master[name].width})">${shapes(name, colour)}</g>`;

function svg(w, h, body, title, desc = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc || '3DClash. AI design coordination identity, version 2.0.')}</desc>${body}</svg>`;
}
const files = [];
function write(rel, content) {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  files.push(rel.replaceAll('\\', '/'));
}
function outline(source) {
  if (!source.includes('<text')) return source;
  return convertSVGTextToPath(source).toString();
}
async function png(rel, source, width, height) {
  const sourceWidth = Number(source.match(/<svg[^>]*width="([\d.]+)"/)?.[1] || width);
  const density = Math.max(72, Math.ceil(width / sourceWidth * 144));
  let pipeline = sharp(Buffer.from(source), { density }).resize(width, height, { fit: 'fill' }).toColourspace('srgb').withIccProfile('srgb');
  write(rel, await pipeline.png({ compressionLevel: 9 }).toBuffer());
}

const TAGLINE = 'AI DESIGN COORDINATION';
function wordmark(colour, tagline = false) {
  const h = tagline ? 474 : 384;
  const body = placed('wordmark', 64, 64, WORDMARK_W, colour) + (tagline ? text(68, 399, 38, TAGLINE, colour, 'letter-spacing="8"') : '');
  return outline(svg(LOCKUP_W, h, body, tagline ? '3DClash wordmark with tagline' : '3DClash wordmark'));
}
const symbol = colour => svg(384, 384, placed('symbol', 64, 64, 256, colour), '3DClash cube symbol');
function icon(size, rounded = false, maskable = false, bg = palette.navy) {
  const w = size * (maskable ? .56 : .62), offset = (size - w) / 2;
  return svg(size, size, rect(0, 0, size, size, bg, rounded ? size * .19 : 0) + placed('symbol', offset, offset, w, palette.white), '3DClash app icon');
}
function favicon(ink = palette.ink) {
  return svg(288, 288, placed('micro', 16, 16, 256, ink), '3DClash favicon', 'Optical-size cube with a wider cut for 16-32 pixel rendering.');
}

async function marks() {
  for (const [variant, colour] of Object.entries({ black: palette.ink, navy: palette.navy, white: palette.white })) {
    const w = wordmark(colour), lock = wordmark(colour, true), s = symbol(colour);
    write(`svg/wordmarks/3dclash-wordmark-${variant}.svg`, w);
    write(`svg/lockups/3dclash-tagline-${variant}.svg`, lock);
    write(`svg/symbols/3dclash-symbol-${variant}.svg`, s);
    for (const width of [512, 1024, 2048, 4096]) await png(`png/wordmarks/3dclash-wordmark-${variant}-${width}w.png`, w, width, Math.round(width * 384 / LOCKUP_W));
    for (const width of [1024, 2048, 4096]) await png(`png/lockups/3dclash-tagline-${variant}-${width}w.png`, lock, width, Math.round(width * 474 / LOCKUP_W));
    for (const size of [64, 128, 256, 512, 1024]) await png(`png/symbols/3dclash-symbol-${variant}-${size}.png`, s, size, size);
  }
  write('svg/wordmarks/3dclash-wordmark-currentcolor.svg', wordmark('currentColor'));
  write('svg/symbols/3dclash-symbol-currentcolor.svg', symbol('currentColor'));
}

async function icons() {
  write('icons/3dclash-app-icon.svg', icon(1024, true));
  write('icons/3dclash-app-icon-square.svg', icon(1024));
  write('icons/3dclash-app-icon-maskable.svg', icon(1024, false, true));
  for (const size of [64, 128, 256, 512, 1024]) await png(`icons/3dclash-app-icon-${size}.png`, icon(size, true), size, size);
  await png('icons/apple-touch-icon.png', icon(180), 180, 180);
  await png('icons/apple-store-icon-1024.png', icon(1024), 1024, 1024);
  await png('icons/mstile-150x150.png', icon(150), 150, 150);
  write('icons/safari-pinned-tab.svg', favicon());
  write('icons/browserconfig.xml', `<?xml version="1.0" encoding="utf-8"?><browserconfig><msapplication><tile><square150x150logo src="mstile-150x150.png"/><TileColor>${palette.navy}</TileColor></tile></msapplication></browserconfig>`);
  for (const size of [192, 512]) {
    await png(`icons/android-chrome-${size}.png`, icon(size), size, size);
    await png(`icons/maskable-icon-${size}.png`, icon(size, false, true), size, size);
  }
  const adaptive = favicon('currentColor').replace('<g transform=', '<style>:root{color:#11161B}@media(prefers-color-scheme:dark){:root{color:#FFFFFF}}</style><g transform=');
  write('icons/favicon.svg', adaptive);
  write('icons/3dclash-symbol-micro.svg', favicon());
  for (const size of [16, 32, 48, 64, 256]) {
    await png(`icons/favicon-${size}.png`, favicon(), size, size);
    const plate = svg(288, 288, rect(0, 0, 288, 288, palette.navy) + placed('micro', 36, 36, 216, palette.white), '3DClash favicon tile');
    await png(`icons/favicon-tile-${size}.png`, plate, size, size);
  }
  write('icons/site.webmanifest', JSON.stringify({ name: '3DClash', short_name: '3DClash', start_url: '/', scope: '/', display: 'standalone', background_color: palette.white, theme_color: palette.navy, icons: [
    { src: 'android-chrome-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'android-chrome-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'maskable-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: 'maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ] }, null, 2) + '\n');
}

function card(w, h, dark, type = 'social') {
  const bg = dark ? palette.navy : palette.paper, fg = dark ? palette.white : palette.ink;
  const muted = dark ? '#B5C4CE' : palette.muted;
  const margin = w * .085;
  let b = rect(0, 0, w, h, bg);
  if (type === 'banner') {
    b += placed('wordmark', margin, h * .28, w * .35, fg);
    b += text(w * .58, h * .44, 29, 'AI design coordination', fg);
    b += text(w * .58, h * .58, 19, 'Observe. Resolve. Check. Apply.', muted);
    b += text(margin, h * .83, 15, 'BUILDINGS AND MACHINES', muted, 'letter-spacing="4"');
  } else {
    const mw = w * (w === h ? .76 : .64), mx = margin;
    const my = h * (w === h ? .31 : .30);
    b += text(margin, h * .14, Math.max(16, w * .014), 'BUILDINGS AND MACHINES', muted, 'letter-spacing="4"');
    b += placed('wordmark', mx, my, mw, fg);
    b += text(margin, h * .68, w * .033, 'AI design coordination', fg);
    b += line(margin, h * .77, w - margin, h * .77, dark ? '#365267' : palette.line);
    b += text(margin, h * .86, w * .017, 'Observe. Resolve. Check. Apply.', muted, 'letter-spacing="1.3"');
  }
  return outline(svg(w, h, b, '3DClash - AI design coordination'));
}

async function collateral() {
  const layouts = [ ['social/og-dark', 1200, 630, true], ['social/og-light', 1200, 630, false],
    ['social/square-dark', 1080, 1080, true], ['social/square-light', 1080, 1080, false],
    ['social/profile-banner', 1584, 396, true, 'banner'],
    ['video/title-dark', 1920, 1080, true], ['video/title-light', 1920, 1080, false] ];
  for (const [rel, w, h, dark, type] of layouts) {
    const s = card(w, h, dark, type);
    write(`${rel}.svg`, s);
    await png(`${rel}.png`, s, w, h);
  }
  for (const [variant, colour] of Object.entries({ black: palette.ink, white: palette.white })) {
    const s = svg(1920, 1080, placed('wordmark', 112, 906, 360, colour), '3DClash transparent video corner bug');
    write(`video/corner-bug-${variant}.svg`, s);
    await png(`video/corner-bug-${variant}.png`, s, 1920, 1080);
  }
}

async function preview() {
  const W = 1800, H = 1500, p = palette;
  let b = rect(0, 0, W, H, p.paper);
  b += text(70, 65, 18, '3DClash  /  ASSET PACK 02', p.ink, 'letter-spacing="3"');
  b += text(1730, 65, 16, 'VERSION 2.0', p.muted, 'text-anchor="end" letter-spacing="2"');
  b += rect(40, 108, 860, 440, p.white) + rect(900, 108, 860, 440, p.navy);
  b += text(76, 153, 13, 'PRIMARY WORDMARK', p.muted, 'letter-spacing="2"');
  b += text(940, 153, 13, 'REVERSED WORDMARK', '#B5C4CE', 'letter-spacing="2"');
  b += placed('wordmark', 100, 264, 730, p.ink) + placed('wordmark', 970, 264, 730, p.white);
  b += rect(40, 572, 550, 416, p.white) + rect(614, 572, 560, 416, p.white) + rect(1198, 572, 562, 416, p.white);
  b += text(76, 617, 13, 'SYMBOL / THREE FACES, ONE CUT', p.muted, 'letter-spacing="1.7"');
  b += placed('symbol', 186, 680, 230, p.ink);
  b += text(650, 617, 13, 'APP ICON', p.muted, 'letter-spacing="2"');
  b += rect(780, 677, 230, 230, p.navy, 44) + placed('symbol', 824, 721, 142, p.white);
  b += text(1234, 617, 13, 'FAVICONS / ACTUAL PIXEL SIZES', p.muted, 'letter-spacing="1.4"');
  for (const [i, size] of [16, 24, 32, 48, 64].entries()) {
    const x = 1262 + i * 91;
    b += placed('micro', x + (64 - size) / 2, 734 + (64 - size) / 2, size, p.ink);
    b += text(x + 32, 840, 15, String(size), p.muted, 'text-anchor="middle"');
  }
  b += text(1234, 921, 15, 'Wider optical cut at small sizes', p.muted);
  b += rect(40, 1012, 860, 350, p.navy) + rect(924, 1012, 836, 350, p.white);
  b += text(76, 1057, 13, 'SOCIAL / VIDEO', '#B5C4CE', 'letter-spacing="2"');
  b += placed('wordmark', 100, 1123, 540, p.white);
  b += text(100, 1320, 23, 'Observe. Resolve. Check. Apply.', '#B5C4CE');
  b += text(960, 1057, 13, 'CORE PALETTE / ATTRIBUTION', p.muted, 'letter-spacing="2"');
  for (const [i, [name, colour]] of Object.entries({ INK: p.ink, NAVY: p.navy, WHITE: p.white }).entries()) {
    const x = 960 + i * 250;
    b += rect(x, 1106, 200, 92, colour) + (name === 'WHITE' ? `<rect x="${x}" y="1106" width="200" height="92" fill="none" stroke="${p.line}"/>` : '');
    b += text(x, 1232, 14, name, p.ink, 'letter-spacing="2"') + text(x, 1258, 15, colour, p.muted);
  }
  b += text(960, 1320, 16, '3DClash / AI design coordination', p.muted);
  b += text(70, 1438, 16, 'Editable SVG  /  Transparent PNG  /  Print PDF + EPS  /  Icons  /  Social + video  /  Usage guide', p.muted);
  const s = outline(svg(W, H, b, '3DClash asset pack overview'));
  write('preview/asset-pack-overview.svg', s);
  await png('preview/asset-pack-overview.png', s, W, H);
  const h = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>3DClash asset pack</title><style>body{margin:0;background:#F5F7F8;font:16px system-ui;color:#11161B}main{max-width:1400px;margin:auto;padding:32px}img{width:100%;height:auto}a{color:#052640}h1{font-size:24px}p{line-height:1.7}nav{display:flex;gap:24px;flex-wrap:wrap;padding:8px 0 24px}</style><main><h1>3DClash / Asset pack 02</h1><nav><a href="../docs/3dclash-brand-guide.pdf">Brand guide</a><a href="../print/3dclash-print-masters.pdf">Print masters</a><a href="../START-HERE.txt">Start here</a></nav><img src="asset-pack-overview.svg" alt="3DClash wordmarks, cube symbol, icons, palette and collateral"><p>Version 2.0. Editable vectors, transparent raster exports and one shared geometry source (source/master.json, written by source/generate-master.py). Updated 16 November 2026.</p></main></html>`;
  write('preview/index.html', h);
}

async function main() {
  await marks(); await icons(); await collateral(); await preview();
  write('tokens/3dclash-colours.json', JSON.stringify({ name: '3DClash', version: '2.0', colours: palette, colourSpace: 'sRGB', capHeight: 256, clearspaceRatio: .25, minimumWordmarkWidthPx: 128, minimumSymbolWidthPx: 24, minimumMicroWidthPx: 16 }, null, 2) + '\n');
  write('tokens/3dclash-tokens.css', ':root {\n' + Object.entries(palette).map(([key, value]) => `  --clash3d-${key}: ${value};`).join('\n') + '\n  --clash3d-font-support: "Inter", "Segoe UI", Arial, sans-serif;\n  --clash3d-clearspace-ratio: 0.25;\n}\n');
  fs.writeFileSync(path.join(__dirname, 'export-list.json'), JSON.stringify(files, null, 2));
  console.log(JSON.stringify({ root: ROOT, generated: files.length, wordmarkWidth: WORDMARK_W, capHeight: master.wordmark.height }));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
