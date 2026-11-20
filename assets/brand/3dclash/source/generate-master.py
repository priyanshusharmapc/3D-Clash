"""Generate source/master.json: the 3DClash cube symbol and the outlined wordmark.

The symbol is an isometric cube made of three faces (top, left, right). Each
face is inset by half the cut, so every pair of neighbouring faces is separated
by one constant gap. The micro symbol uses the same faces with a wider cut.

The wordmark sets "3DClash" in Poppins Bold (SIL Open Font License 1.1) and
outlines each glyph to paths. Glyph outlines are converted to cubic curves.
The letter spacing is tightened by a fixed optical amount, and the canvas takes
the resulting width, so the cap height stays at 256 units.

Python 3.10+ and fontTools. Run after changing the geometry; every export
reads the JSON this writes.

    python3 source/generate-master.py --font /path/to/Poppins-Bold.ttf
"""
from __future__ import annotations

import argparse
import json
import math
import os
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
PALETTE = {'ink': '#11161B', 'navy': '#052640', 'white': '#FFFFFF',
           'paper': '#F5F7F8', 'line': '#DDE3E7', 'muted': '#52636E'}
CAP = 256                   # wordmark height (ink top to bottom), in master units
SYMBOL_BOX = 256            # symbol canvas
SYMBOL_HEIGHT = 224         # cube height inside the canvas (16 units of air top and bottom)
TRACKING = -14              # optical letter spacing, in font units (about -1.4 % of the em)
TEXT = '3DClash'
GROUPS = [[0, 1], [2, 3], [4, 5], [6]]   # reveal order: "3D", "Cl", "as", "h"
EXPLODE = 16                # units each face travels in the breathe and resolve motion
COS30 = math.cos(math.radians(30))


def inset(poly, distance):
    """Move each edge of a convex polygon inwards by `distance` and re-intersect the edges."""
    n = len(poly)
    cx = sum(p[0] for p in poly) / n
    cy = sum(p[1] for p in poly) / n
    lines = []
    for i in range(n):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % n]
        dx, dy = x2 - x1, y2 - y1
        length = math.hypot(dx, dy)
        nx, ny = -dy / length, dx / length
        if (cx - x1) * nx + (cy - y1) * ny < 0:
            nx, ny = -nx, -ny
        lines.append(((x1 + distance * nx, y1 + distance * ny), (dx, dy)))
    out = []
    for i in range(n):
        (px, py), (ux, uy) = lines[i - 1]
        (qx, qy), (vx, vy) = lines[i]
        cross = lambda ax, ay, bx, by: ax * by - ay * bx
        t = cross(qx - px, qy - py, vx, vy) / cross(ux, uy, vx, vy)
        out.append((px + t * ux, py + t * uy))
    return out


def faces(edge, cut):
    """Top, left and right faces of an isometric cube centred on the origin."""
    o = (0.0, 0.0)
    top, ur, lr, bottom = (0.0, -edge), (COS30 * edge, -edge / 2), (COS30 * edge, edge / 2), (0.0, edge)
    ll, ul = (-COS30 * edge, edge / 2), (-COS30 * edge, -edge / 2)
    raw = [[top, ur, o, ul], [ul, o, bottom, ll], [o, ur, lr, bottom]]
    return [inset(face, cut / 2) for face in raw]


def extent(polys):
    xs = [x for poly in polys for x, _ in poly]
    ys = [y for poly in polys for _, y in poly]
    return min(xs), min(ys), max(xs), max(ys)


def fit_cube(cut):
    """Find the edge length whose inset cube is SYMBOL_HEIGHT tall, then centre it on the canvas."""
    low, high = 40.0, 200.0
    for _ in range(80):
        mid = (low + high) / 2
        x0, y0, x1, y1 = extent(faces(mid, cut))
        if y1 - y0 > SYMBOL_HEIGHT:
            high = mid
        else:
            low = mid
    polys = faces(low, cut)
    x0, y0, x1, y1 = extent(polys)
    dx = SYMBOL_BOX / 2 - (x0 + x1) / 2
    dy = SYMBOL_BOX / 2 - (y0 + y1) / 2
    placed = [[(x + dx, y + dy) for x, y in poly] for poly in polys]
    return placed, low


def to_commands(poly):
    commands = [['M', round(poly[0][0], 5), round(poly[0][1], 5)]]
    commands += [['L', round(x, 5), round(y, 5)] for x, y in poly[1:]]
    commands.append(['Z'])
    return commands


def explode_vectors(cut):
    """Radial unit vectors from the cube centre, scaled to EXPLODE units, one per face."""
    polys = faces(fit_cube(cut)[1], cut)
    vectors = []
    for poly in polys:
        cx = sum(x for x, _ in poly) / len(poly)
        cy = sum(y for _, y in poly) / len(poly)
        length = math.hypot(cx, cy)
        vectors.append([round(cx / length * EXPLODE, 3), round(cy / length * EXPLODE, 3)])
    return vectors


class Outline(BasePen):
    """Record a glyph as M, L, C and Z commands; quadratic segments are raised to cubic."""

    def __init__(self, glyph_set, transform):
        super().__init__(glyph_set)
        self.transform = transform
        self.commands = []

    def _moveTo(self, p):
        self.commands.append(['M', *self.transform(p)])

    def _lineTo(self, p):
        self.commands.append(['L', *self.transform(p)])

    def _curveToOne(self, p1, p2, p3):
        self.commands.append(['C', *self.transform(p1), *self.transform(p2), *self.transform(p3)])

    def _closePath(self):
        self.commands.append(['Z'])


def wordmark(font_path):
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    names = [cmap[ord(ch)] for ch in TEXT]
    advances = [font['hmtx'][name][0] for name in names]
    bounds = []
    for name in names:
        pen = BoundsPen(glyph_set)
        glyph_set[name].draw(pen)
        bounds.append(pen.bounds)
    origins = [sum(advances[:i]) for i in range(len(names))]
    top = max(b[3] for b in bounds)
    bottom = min(b[1] for b in bounds)
    scale = CAP / (top - bottom)
    ink_left = origins[0] + bounds[0][0]
    ink_right = origins[-1] + bounds[-1][2]
    width = round((ink_right - ink_left + TRACKING * (len(names) - 1)) * scale)
    paths = []
    for i, name in enumerate(names):
        origin = origins[i] + i * TRACKING
        pen = Outline(glyph_set, lambda p, o=origin: (round((o + p[0] - ink_left) * scale, 5),
                                                     round((top - p[1]) * scale, 5)))
        glyph_set[name].draw(pen)
        paths.append(pen.commands)
    report = {'wordmark_width': width, 'scale': round(scale, 6), 'tracking_font_units': TRACKING,
              'font_units_per_em': font['head'].unitsPerEm}
    return paths, width, report


def build(font_path):
    symbol, edge = fit_cube(18)
    micro, micro_edge = fit_cube(24)
    glyph_paths, width, report = wordmark(font_path)
    master = {
        'name': '3DClash',
        'version': '2.0',
        'date': '2026-11-16',
        'description': 'An isometric cube symbol and a 3DClash wordmark outlined from Poppins Bold. Generated by source/generate-master.py.',
        'palette': PALETTE,
        'geometry': {'capHeight': CAP, 'clearspace': 64, 'cutWidth': 18, 'microCutWidth': 24},
        'symbol': {'width': SYMBOL_BOX, 'height': SYMBOL_BOX, 'paths': [to_commands(p) for p in symbol],
                   'explode': explode_vectors(18)},
        'micro': {'width': SYMBOL_BOX, 'height': SYMBOL_BOX, 'paths': [to_commands(p) for p in micro]},
        'wordmark': {'width': width, 'height': CAP, 'paths': glyph_paths, 'groups': GROUPS,
                     'text': TEXT, 'typeface': 'Poppins Bold', 'licence': 'SIL Open Font License 1.1'},
    }
    return master, {'symbol_edge': round(edge, 3), 'micro_edge': round(micro_edge, 3), **report}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--font', default=os.environ.get('CLASH3D_WORDMARK_FONT'),
                        help='Poppins Bold .ttf (or set CLASH3D_WORDMARK_FONT)')
    args = parser.parse_args()
    if not args.font or not Path(args.font).exists():
        parser.error('Pass --font with the Poppins Bold file, or set CLASH3D_WORDMARK_FONT.')
    master, report = build(args.font)
    target = ROOT / 'source' / 'master.json'
    target.write_text(json.dumps(master, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
