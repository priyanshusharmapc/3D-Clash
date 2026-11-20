# 3DClash identity and motion assets

Version 2.0, 16 November 2026. The identity is an isometric cube symbol and a 3DClash wordmark set in Poppins Bold and outlined to paths. Both share the geometry in [`source/master.json`](source/master.json), which [`source/generate-master.py`](source/generate-master.py) writes.

Open the [static overview](preview/index.html) or the [motion gallery](motion/preview/index.html). This directory is an asset library; the application does not import it directly. [Design and integration notes](../../../docs/brand-assets.md) describe how the application uses it.

## Files

| Directory | Contents |
| --- | --- |
| `svg/` | Outlined wordmarks, symbols and tagline lockups in ink, navy and white, plus currentColor variants |
| `png/` | Transparent wordmarks up to 4096 px wide and symbols up to 1024 px |
| `icons/` | Adaptive SVG favicon, multi-size ICO, Apple/Android/Windows icons, maskable variants and web manifest |
| `social/`, `video/` | Light/dark social cards, profile banner, title cards and transparent corner overlays |
| `print/`, `docs/` | Vector PDF/EPS print masters and the four-page brand guide |
| `tokens/` | CSS and JSON palette and sizing tokens |
| `source/` | Canonical geometry, the geometry generator, the static build and the export inventory |
| `motion/svg/` | Orbit, Breathe, Resolve, phase-cycle demo, Settle and Reveal in three colours |
| `motion/apng/`, `motion/gif/` | Transparent APNG exports and light/dark GIF previews |
| `motion/web/`, `motion/react/` | Native elements, a working example, declarations and React wrappers |
| `motion/source/` | Motion generation and packaging; consumes the shared master |

[`START-HERE.txt`](START-HERE.txt) lists every deliverable. [`manifest.json`](manifest.json) lists each file with its size, dimensions where relevant and SHA-256 hash.

The `.gitattributes` file keeps text in LF and declares PDF, PNG, GIF and ICO files binary, so Windows checkout conversion does not alter print files or the recorded hashes.

## Build

Use Node 22+ and Python 3.10+. Install the generator dependencies once:

```sh
npm ci
python -m pip install -r requirements.txt
```

From this directory, after changing the geometry:

```sh
python source/generate-master.py --font /path/to/Poppins-Bold.ttf   # writes source/master.json
CLASH3D_SUPPORT_FONT=/path/to/Inter-Regular.otf node source/build-assets.cjs
python source/build-print.py --skip-package                         # guide, print masters, EPS, ICO, manifest
node motion/source/build-motion.cjs
node motion/source/build-components.cjs
python motion/source/package-motion.py                              # GIF/APNG and the motion manifest
```

If the Node packages live elsewhere, pass `--deps /absolute/path/to/node_modules` to the Node commands. `CLASH3D_SUPPORT_FONT` names the font used to set the tagline and card text during the build; the text is outlined, so no font file is needed to use the outputs. Font files are not redistributed. The wordmark outlines derive from Poppins Bold, licensed under the SIL Open Font License 1.1.

The build checks PNG decoding, transparency and clear space; SVG parsing and outlined text; PDF reopening and text extraction; manifest icon paths; and maskable safe areas. It prints a summary and writes no report file. Frame intermediates and browser screenshots go to the ignored `motion/.build/` directory; archives go to ignored `dist/` directories.

For the browser check:

```sh
npx playwright install chromium
npm run check:browser
```

The checker starts a temporary loopback server and a fresh headless browser. It exercises the motion, pause, speed, size, responsive layout, final reveal states, reduced motion, accessible labels and phase control, and prints a summary.

## Integrating

Copy only the assets an application needs. Use Orbit for general loading. The phase component accepts actual `observe`, `resolve`, `check` and `apply` events and never invents progress. Run Settle only after a confirmed action. The SVG and native components honour reduced motion; GIF and APNG files do not, so the host must choose a static fallback when reduced motion is requested. See [motion usage](motion/START-HERE.txt).
