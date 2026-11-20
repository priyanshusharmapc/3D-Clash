// 3DClash's identity in the app (docs/brand-assets.md): the wordmark, the cube symbol, the notch at the top of the
// model, the loading card and the completed-action mark. The paths are the kit's own (assets/brand/3dclash/source/
// master.json, version 2.0, written by generate-master.py); the motion follows the kit's timings (Orbit 1.6 s,
// Settle 0.76 s, Reveal 1.6 s).

/** The cube's three faces (top, left, right) in the master's order; the viewBox is 256 units square. */
const FACES = [
  "M 128.0 16.0 L 218.24485 68.10289 L 128.0 120.20577 L 37.75515 68.10289 Z",
  "M 28.75515 83.69134 L 119.0 135.79423 L 119.0 240.0 L 28.75515 187.89711 Z",
  "M 137.0 135.79423 L 227.24485 83.69134 L 227.24485 187.89711 L 137.0 240.0 Z",
];

/** The wordmark's seven glyph outlines, "3DClash" in Poppins Bold (SIL Open Font License 1.1), left to right. */
const WORD = [
  "M 87.48079 0.0 C 104.43444 0.0 118.95806 2.93863 131.05166 8.81589 C 143.14525 14.69316 152.30022 22.71788 158.51656 32.89007 C 164.73289 43.06225 167.84106 54.4777 167.84106 67.13642 C 167.84106 82.05563 164.11126 94.20574 156.65166 103.58675 C 149.19205 112.96777 140.48918 119.35364 130.54305 122.74437 L 130.54305 124.10066 C 143.42781 128.39558 153.6 135.51611 161.0596 145.46225 C 168.51921 155.40839 172.24901 168.18013 172.24901 183.77748 C 172.24901 197.79249 169.02781 210.16865 162.58543 220.90596 C 156.14305 231.64327 146.76203 240.06358 134.44238 246.16689 C 122.12274 252.2702 107.48609 255.32185 90.53245 255.32185 C 63.40662 255.32185 41.76247 248.65342 25.6 235.31656 C 9.43753 221.97969 0.90419 201.86137 0.0 174.96159 L 56.28609 174.96159 C 56.51214 184.90773 59.33775 192.76291 64.76291 198.52715 C 70.18808 204.29139 78.09978 207.17351 88.49801 207.17351 C 97.31391 207.17351 104.15188 204.63046 109.01192 199.54437 C 113.87196 194.45828 116.30199 187.73333 116.30199 179.36954 C 116.30199 168.51921 112.85475 160.66402 105.96026 155.80397 C 99.06578 150.94393 88.04592 148.51391 72.90066 148.51391 L 62.05033 148.51391 L 62.05033 101.38278 L 72.90066 101.38278 C 84.42914 101.38278 93.75364 99.40486 100.87417 95.44901 C 107.9947 91.49316 111.55497 84.42914 111.55497 74.25695 C 111.55497 66.11921 109.29448 59.78985 104.77351 55.26887 C 100.25254 50.7479 94.0362 48.48742 86.1245 48.48742 C 77.53466 48.48742 71.14879 51.08698 66.96689 56.28609 C 62.78499 61.48521 60.35497 67.92759 59.67682 75.61325 L 3.05166 75.61325 C 3.95585 51.42605 11.86755 32.77704 26.78675 19.66623 C 41.70596 6.55541 61.93731 0.0 87.48079 0.0 Z",
  "M 421.12848 134.27285 C 421.12848 157.55585 415.98587 178.23929 405.70066 196.32318 C 395.41545 214.40706 380.83532 228.42208 361.96026 238.36821 C 343.08521 248.31435 321.21501 253.28742 296.34967 253.28742 L 207.17351 253.28742 L 207.17351 15.25828 L 296.34967 15.25828 C 321.44106 15.25828 343.36777 20.23135 362.1298 30.17748 C 380.89183 40.12362 395.41545 54.08212 405.70066 72.05298 C 415.98587 90.02384 421.12848 110.7638 421.12848 134.27285 Z M 362.1298 134.27285 C 362.1298 112.34614 356.02649 95.27947 343.81987 83.07285 C 331.61325 70.86623 314.54658 64.76291 292.61987 64.76291 L 265.15497 64.76291 L 265.15497 203.10464 L 292.61987 203.10464 C 314.54658 203.10464 331.61325 197.11435 343.81987 185.13377 C 356.02649 173.1532 362.1298 156.19956 362.1298 134.27285 Z",
  "M 558.79205 12.5457 C 587.04812 12.5457 611.23532 20.0053 631.35364 34.9245 C 651.47196 49.84371 664.92185 70.18808 671.70331 95.95762 L 607.95762 95.95762 C 603.2106 86.01148 596.48565 78.43885 587.78278 73.23974 C 579.07991 68.04062 569.19029 65.44106 558.11391 65.44106 C 540.25607 65.44106 525.78896 71.6574 514.71258 84.09007 C 503.6362 96.52274 498.09801 113.13731 498.09801 133.93377 C 498.09801 154.73024 503.6362 171.34481 514.71258 183.77748 C 525.78896 196.21015 540.25607 202.42649 558.11391 202.42649 C 569.19029 202.42649 579.07991 199.82693 587.78278 194.62781 C 596.48565 189.4287 603.2106 181.85607 607.95762 171.90993 L 671.70331 171.90993 C 664.92185 197.67947 651.47196 217.96733 631.35364 232.77351 C 611.23532 247.57969 587.04812 254.98278 558.79205 254.98278 C 535.7351 254.98278 515.10817 249.84018 496.91126 239.55497 C 478.71435 229.26976 464.5298 214.97219 454.35762 196.66225 C 444.18543 178.35232 439.09934 157.44283 439.09934 133.93377 C 439.09934 110.42472 444.18543 89.45872 454.35762 71.03576 C 464.5298 52.6128 478.71435 38.25872 496.91126 27.97351 C 515.10817 17.6883 535.7351 12.5457 558.79205 12.5457 Z",
  "M 760.5404 2.37351 L 760.5404 253.28742 L 702.55894 253.28742 L 702.55894 2.37351 Z",
  "M 869.72185 61.37219 C 883.05872 61.37219 894.75673 64.08477 904.81589 69.50993 C 914.87506 74.9351 922.61722 82.05563 928.04238 90.87152 L 928.04238 64.08477 L 986.02384 64.08477 L 986.02384 253.28742 L 928.04238 253.28742 L 928.04238 226.50066 C 922.39117 235.31656 914.53598 242.43709 904.47682 247.86225 C 894.41766 253.28742 882.71965 256.0 869.38278 256.0 C 854.01148 256.0 839.99647 251.98764 827.33775 243.96291 C 814.67903 235.93819 804.67638 224.52274 797.3298 209.71656 C 789.98322 194.91038 786.30993 177.7872 786.30993 158.34702 C 786.30993 138.90684 789.98322 121.84018 797.3298 107.14702 C 804.67638 92.45386 814.67903 81.15143 827.33775 73.23974 C 839.99647 65.32804 854.1245 61.37219 869.72185 61.37219 Z M 886.6755 111.89404 C 875.14702 111.89404 865.37042 116.01943 857.3457 124.2702 C 849.32097 132.52097 845.30861 143.87991 845.30861 158.34702 C 845.30861 172.81413 849.32097 184.28609 857.3457 192.76291 C 865.37042 201.23974 875.14702 205.47815 886.6755 205.47815 C 898.20397 205.47815 907.98057 201.29625 916.0053 192.93245 C 924.03002 184.56865 928.04238 173.1532 928.04238 158.68609 C 928.04238 144.21898 924.03002 132.80353 916.0053 124.43974 C 907.98057 116.07594 898.20397 111.89404 886.6755 111.89404 Z",
  "M 1013.14967 191.23709 L 1070.45298 191.23709 C 1071.13113 197.79249 1074.18278 203.10464 1079.60795 207.17351 C 1085.03311 211.24238 1091.70155 213.27682 1099.61325 213.27682 C 1106.8468 213.27682 1112.4415 211.86402 1116.39735 209.03841 C 1120.3532 206.2128 1122.33113 202.53951 1122.33113 198.01854 C 1122.33113 192.59338 1119.50552 188.58102 1113.8543 185.98146 C 1108.20309 183.3819 1099.04812 180.49978 1086.3894 177.3351 C 1072.82649 174.17042 1061.52406 170.8362 1052.48212 167.33245 C 1043.44018 163.8287 1035.6415 158.29051 1029.08609 150.71788 C 1022.53068 143.14525 1019.25298 132.91656 1019.25298 120.03179 C 1019.25298 109.18146 1022.24812 99.29183 1028.23841 90.36291 C 1034.2287 81.434 1043.04459 74.36998 1054.68609 69.17086 C 1066.32759 63.97174 1080.17307 61.37219 1096.22252 61.37219 C 1119.95762 61.37219 1138.66313 67.24945 1152.33907 79.00397 C 1166.01501 90.7585 1173.8702 106.35585 1175.90464 125.79603 L 1122.33113 125.79603 C 1121.42693 119.24062 1118.54481 114.0415 1113.68477 110.19868 C 1108.82472 106.35585 1102.43885 104.43444 1094.52715 104.43444 C 1087.7457 104.43444 1082.54658 105.73422 1078.9298 108.33377 C 1075.31302 110.93333 1073.50464 114.4936 1073.50464 119.01457 C 1073.50464 124.43974 1076.38675 128.50861 1082.15099 131.22119 C 1087.91523 133.93377 1096.90066 136.64636 1109.10728 139.35894 C 1123.1223 142.97572 1134.53775 146.53598 1143.35364 150.03974 C 1152.16954 153.54349 1159.9117 159.1947 1166.58013 166.99338 C 1173.24857 174.79205 1176.69581 185.2468 1176.92185 198.35762 C 1176.92185 209.434 1173.81369 219.32362 1167.59735 228.02649 C 1161.38102 236.72936 1152.4521 243.56733 1140.8106 248.5404 C 1129.16909 253.51347 1115.66269 256.0 1100.29139 256.0 C 1083.78985 256.0 1069.09669 253.17439 1056.21192 247.52318 C 1043.32715 241.87196 1033.15497 234.1298 1025.69536 224.29669 C 1018.23576 214.46358 1014.05386 203.44371 1013.14967 191.23709 Z",
  "M 1395.96291 142.74967 L 1395.96291 253.28742 L 1338.32053 253.28742 L 1338.32053 150.54834 C 1338.32053 137.88962 1335.04283 128.05651 1328.48742 121.04901 C 1321.93201 114.0415 1313.11611 110.53775 1302.03974 110.53775 C 1290.96336 110.53775 1282.14746 114.0415 1275.59205 121.04901 C 1269.03664 128.05651 1265.75894 137.88962 1265.75894 150.54834 L 1265.75894 253.28742 L 1207.77748 253.28742 L 1207.77748 2.37351 L 1265.75894 2.37351 L 1265.75894 89.51523 C 1271.6362 81.15143 1279.66093 74.483 1289.83311 69.50993 C 1300.0053 64.53687 1311.42075 62.05033 1324.07947 62.05033 C 1345.78013 62.05033 1363.18587 69.22737 1376.29669 83.58146 C 1389.40751 97.93554 1395.96291 117.65828 1395.96291 142.74967 Z",
];

/** The wordmark's artwork size in its own units: 1396 wide, 256 tall (ink top to bottom). */
const WORD_W = 1396;
const WORD_H = 256;

/** The 3DClash wordmark in the current text colour. `height` is the wordmark's height in px; 28 px is 153 px
 *  wide, above the 128 px minimum for artwork. */
export function Wordmark({ height = 28, title = "3DClash" }: { height?: number; title?: string }) {
  return (
    <svg className="wordmark" width={Math.round(height * WORD_W / WORD_H)} height={height} viewBox={`0 0 ${WORD_W} ${WORD_H}`} fill="currentColor"
      role="img" aria-label={title}>
      {WORD.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

/** The cube symbol. `motion`: orbit (indeterminate work), settle (once, after a confirmed action) or none. */
export function Clash3DMark({ size = 24, motion = "none" }: { size?: number; motion?: "none" | "orbit" | "settle" }) {
  return (
    <svg className={`clash3d-mark ${motion}`} width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <g>{FACES.map((d) => <path key={d} d={d} />)}</g>
    </svg>
  );
}

/** The app icon: the white cube on a navy tile (phones and tablets, where the wordmark has no room). */
export function AppIcon({ size = 30 }: { size?: number }) {
  return (
    <svg className="app-icon" width={size} height={size} viewBox="0 0 256 256" role="img" aria-label="3DClash">
      <rect width="256" height="256" rx="56" fill="var(--navy)" />
      <g transform="translate(48 48) scale(.625)" fill="#fff">{FACES.map((d) => <path key={d} d={d} />)}</g>
    </svg>
  );
}

/** What the notch says while 3DClash works: a title, a detail line and, when the work has countable parts (models
 *  drawn), one bar segment per part. Every value comes from a real event; nothing advances on a timer. */
export interface NotchStatus { title: string; detail?: string; parts?: { done: number; total: number } }

/** The logo hanging from the top edge of the model. While 3DClash works it grows to show what is happening, and folds
 *  back to the wordmark when the work ends. */
export function Notch({ status, onLogo }: { status: NotchStatus | null; onLogo: () => void }) {
  return (
    <div className={`notch ${status ? "working" : ""}`} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <span className="notch-shoulder left" aria-hidden />
      {status ? (
        <div className="notch-body" role="status" aria-live="polite">
          <div className="notch-line">
            <Clash3DMark size={24} motion="orbit" />
            <span className="notch-text"><b>{status.title}</b>{status.detail && <span>{status.detail}</span>}</span>
          </div>
          {status.parts && status.parts.total > 1 && <Parts {...status.parts} />}
        </div>
      ) : (
        <button type="button" className="notch-body notch-logo" onClick={onLogo} aria-label="About 3DClash" data-tip="About 3DClash" data-tip-side="bottom">
          <Wordmark height={20} />
        </button>
      )}
      <span className="notch-shoulder right" aria-hidden />
    </div>
  );
}

function Parts({ done, total }: { done: number; total: number }) {
  return (
    <div className="parts" aria-hidden style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
      {Array.from({ length: total }, (_, i) => <span key={i} className={i < done ? "done" : i === done ? "now" : ""} />)}
    </div>
  );
}

/** Opening models, step by step: the server opens them, the page downloads each file, then draws each one. */
export interface LoadProgress {
  title: string;
  files: string[];
  step: "server" | "download" | "draw";
  /** The server's own words while it works (an upload's stages); else the step's. */
  line?: string;
  fetched: number;
  bytes: number;
  drawn: number;
  elements: number;
  /** When each step ended, ms since `started`. */
  started: number;
  ends: Partial<Record<"server" | "download", number>>;
}

const STEPS = ["server", "download", "draw"] as const;

/** The checklist card in the middle of an empty model while the first models open. */
export function LoadCard({ load, now }: { load: LoadProgress; now: number }) {
  const at = STEPS.indexOf(load.step);
  const n = load.files.length;
  const secs = (ms?: number) => (ms == null ? "" : `${(ms / 1000).toFixed(1)} s`);
  const rows: { text: string; aside: string; extra?: React.ReactNode }[] = [
    { text: at > 0 ? "Opened on the server" : load.line ?? "Opening on the server", aside: at > 0 ? secs(load.ends.server) : "" },
    { text: at > 1 ? `Downloaded ${n} of ${n} model${n === 1 ? "" : "s"}` : `Downloading model${n === 1 ? "" : "s"}: ${load.fetched} of ${n}`,
      aside: load.bytes ? `${(load.bytes / 1e6).toFixed(1)} MB` : "" },
    { text: at === 2 && load.drawn < n ? `Drawing model ${load.drawn + 1} of ${n}: ${load.files[load.drawn]}` : `Drawing the model${n === 1 ? "" : "s"}`,
      aside: load.elements ? `${load.elements.toLocaleString()} elements` : "",
      extra: at === 2 && n > 1 ? <><Parts done={load.drawn} total={n} />
        <p className="hint">{load.files.map((f, i) => `${f}${i < load.drawn ? " ✓" : ""}`).join(" · ")}</p></> : null },
  ];
  return (
    <section className="load-card" role="status" aria-live="polite" onClick={(e) => e.stopPropagation()}>
      <div className="load-head">
        <Clash3DMark size={44} motion="orbit" />
        <div><h2>{load.title}</h2>
          <p className="hint">{n} model{n === 1 ? "" : "s"} · {Math.max(0, Math.round((now - load.started) / 1000))} s</p></div>
      </div>
      <ol className="load-steps">
        {rows.map((r, i) => (
          <li key={i} className={i < at ? "done" : i === at ? "now" : "next"}>
            <span className="tick" aria-hidden />
            <div className="load-row">
              <div className="row"><span>{r.text}</span><span className="mono why">{i <= at ? r.aside : ""}</span></div>
              {i === at && r.extra}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** A confirmed, completed action (a fix kept in the model): the mark settles once beside the words. */
export function KeptToast({ text, detail }: { text: string; detail?: string }) {
  return (
    <div className="toast kept" role="status">
      <Clash3DMark size={28} motion="settle" />
      <span><b>{text}</b>{detail && <><br /><span className="why">{detail}</span></>}</span>
    </div>
  );
}
