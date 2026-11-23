# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools[woff]==4.68.0"]
# ///
"""Cut Mona Sans down to what the built site uses and write the web fonts.

Run by hand after a build, then commit what it writes:

    bun run build
    uv run scripts/subset-fonts.py

By default an axis only loses the side of its default the site never reaches:
the variation deltas that can never apply are deleted and the rest are left
byte for byte, so glyphs rasterize exactly as before. The `prep` program stays
too, because dropping it moves a few pixels on Windows. `--tight` cuts every
axis to the used range instead: smaller files, but the remaining deltas are
rescaled and rounded, which moves some antialiased pixels.

Rerun it when the CSS asks for a font-weight or font-stretch outside the
ranges in src/styles/fonts.css, turns on an OpenType feature
(font-feature-settings, font-variant-*), or when SOURCE_URL changes.
New text never needs a rerun: the files keep every character the site drew
with Mona Sans before, so content only decides which files a page loads.
"""

import hashlib
import io
import re
import sys
import unicodedata
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist" / "client"
CACHE = ROOT / ".cache" / "fonts"
OUT_FONTS = ROOT / "src" / "assets" / "fonts"
OUT_CSS = ROOT / "src" / "styles" / "fonts.css"

SOURCE_URL = "https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/monasans/MonaSans%5Bwdth%2Cwght%5D.ttf"
SOURCE_SHA256 = "fd6e79634b5ae804a45aac7e2e3c2a325b41291fba59034f4732b0135b8475b3"

# "Mona" is a Reserved Font Name under the OFL, so a modified copy needs its own name.
FAMILY = "Hezaerd Sans"
FILE_STEM = "hezaerd-sans"


def ranges(*spans: tuple[int, int]) -> set[int]:
    return {c for a, b in spans for c in range(a, b + 1)}


# The files copy how Fontsource split Mona Sans, so every character is drawn by
# the same font, in the same shaping run, as before. Glyphs outside these ranges
# (arrows, math, circled digits) were drawn by system fonts before and still are.
# The core is Fontsource's `latin` subset: ASCII, Latin-1 and common punctuation,
# so an accented Latin-1 letter is still kerned against its ASCII neighbours.
LATIN = ranges(
    (0x0000, 0x00FF), (0x0131, 0x0131), (0x0152, 0x0153), (0x02BB, 0x02BC), (0x02C6, 0x02C6),
    (0x02DA, 0x02DA), (0x02DC, 0x02DC), (0x0304, 0x0304), (0x0308, 0x0308), (0x0329, 0x0329),
    (0x2000, 0x206F), (0x20AC, 0x20AC), (0x2122, 0x2122), (0x2191, 0x2191), (0x2193, 0x2193),
    (0x2212, 0x2212), (0x2215, 0x2215), (0xFEFF, 0xFEFF), (0xFFFD, 0xFFFD),
)
LATIN_EXT = ranges(
    (0x0100, 0x02BA), (0x02BD, 0x02C5), (0x02C7, 0x02CC), (0x02CE, 0x02D7), (0x02DD, 0x02FF),
    (0x0304, 0x0304), (0x0308, 0x0308), (0x0329, 0x0329), (0x1D00, 0x1DBF), (0x1E00, 0x1E9F),
    (0x1EF2, 0x1EFF), (0x2020, 0x2020), (0x20A0, 0x20AB), (0x20AD, 0x20C0), (0x2113, 0x2113),
    (0x2C60, 0x2C7F), (0xA720, 0xA7FF),
)
VIETNAMESE = ranges(
    (0x0102, 0x0103), (0x0110, 0x0111), (0x0128, 0x0129), (0x0168, 0x0169), (0x01A0, 0x01A1),
    (0x01AF, 0x01B0), (0x0300, 0x0301), (0x0303, 0x0304), (0x0308, 0x0309), (0x0323, 0x0323),
    (0x0329, 0x0329), (0x1EA0, 0x1EF9), (0x20AB, 0x20AB),
)
# Chrome draws a base letter and its marks from one face only when that face is
# loaded, its cmap has every character, and its unicode-range lists the marks.
# Like Fontsource's files, every file carries these eight marks, the core also
# carries Ă and lacks U+2030, and merging two files would change which decomposed
# accents (z + U+0301) get drawn by Mona Sans. Where ranges overlap, the face
# declared last wins, so the core comes last.
MARKS = {0x0300, 0x0301, 0x0303, 0x0304, 0x0308, 0x0309, 0x0323, 0x0329}
FILES = {
    "core": ((LATIN | MARKS | {0x0102}) - {0x2030}, LATIN),
    "latin-ext": ((LATIN_EXT - LATIN) | MARKS, LATIN_EXT),
    "vietnamese": ((VIETNAMESE - LATIN) | MARKS, VIETNAMESE),
}

# Features browsers turn on without being asked.
DEFAULT_FEATURES = {"ccmp", "locl", "rlig", "liga", "clig", "calt", "kern", "mark", "mkmk", "rvrn"}
VARIANT_FEATURES = {
    "tabular-nums": "tnum", "proportional-nums": "pnum", "oldstyle-nums": "onum",
    "lining-nums": "lnum", "diagonal-fractions": "frac", "stacked-fractions": "afrc",
    "ordinal": "ordn", "slashed-zero": "zero", "small-caps": "smcp", "all-small-caps": "c2sc",
    "titling-caps": "titl", "sub": "subs", "super": "sups",
}
STRETCH_KEYWORDS = {
    "ultra-condensed": 50, "extra-condensed": 62.5, "condensed": 75, "semi-condensed": 87.5,
    "normal": 100, "semi-expanded": 112.5, "expanded": 125, "extra-expanded": 150, "ultra-expanded": 200,
}


def source_font() -> Path:
    path = CACHE / "MonaSans[wdth,wght].ttf"
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        path.write_bytes(urllib.request.urlopen(SOURCE_URL).read())
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != SOURCE_SHA256:
        sys.exit(f"{path} has sha256 {digest}, expected {SOURCE_SHA256}")
    return path


class Page(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.text: list[str] = []
        self.styles: list[str] = []
        self.tags: set[str] = set()
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag)
        if tag in ("script", "style", "template", "title"):
            self._skip += 1
        for name, value in attrs:
            if name == "style" and value:
                self.styles.append(value)
            if name in ("placeholder", "value") and value:
                self.text.append(value)

    def handle_endtag(self, tag):
        if tag in ("script", "style", "template", "title"):
            self._skip -= 1

    def handle_data(self, data):
        if self._skip == 0:
            self.text.append(data)


def read_site() -> tuple[dict[str, Page], str]:
    if not DIST.exists():
        sys.exit("No dist/client. Build the site first: bun run build")
    pages = {}
    for html in sorted(DIST.rglob("*.html")):
        page = Page()
        raw = html.read_text(encoding="utf-8")
        page.feed(raw)
        page.styles += re.findall(r"<style[^>]*>(.*?)</style>", raw, re.S)
        pages[html.relative_to(DIST).as_posix()] = page
    css = "\n".join(p.read_text(encoding="utf-8") for p in sorted(DIST.rglob("*.css")))
    css += "\n" + "\n".join(s for p in pages.values() for s in p.styles)
    return pages, re.sub(r"@font-face\s*{[^}]*}", "", css)


def declarations(css: str, prop: str) -> list[str]:
    return [v.strip() for v in re.findall(rf"(?<![-\w]){prop}\s*:\s*([^;}}]+)", css)]


def bolder(w: float) -> float:
    return 400 if w < 350 else 700 if w < 550 else 900 if w < 900 else w


def lighter(w: float) -> float:
    return w if w < 100 else 100 if w < 550 else 400 if w < 750 else 700


def used_axes(css: str, tags: set[str]) -> tuple[tuple[float, float], tuple[float, float], list[str]]:
    notes = []
    weights = {400.0}
    relative = set()
    for v in declarations(css, "font-weight"):
        if re.fullmatch(r"\d+(\.\d+)?", v):
            weights.add(float(v))
        elif v == "bold":
            weights.add(700.0)
        elif v in ("bolder", "lighter"):
            relative.add(v)
    if relative and tags & {"b", "strong"}:
        for w in list(weights):
            weights.add(bolder(w) if "bolder" in relative else lighter(w))
        notes.append(f"<b>/<strong> present, so {', '.join(sorted(relative))} widens the weights")
    stretches = {100.0}
    for v in declarations(css, "font-stretch"):
        if m := re.fullmatch(r"(\d+(\.\d+)?)%", v):
            stretches.add(float(m[1]))
        elif v in STRETCH_KEYWORDS:
            stretches.add(float(STRETCH_KEYWORDS[v]))
    for v in declarations(css, "font-variation-settings"):
        for tag, value in re.findall(r"""["'](\w{4})["']\s+(-?[\d.]+)""", v):
            (weights if tag == "wght" else stretches if tag == "wdth" else set()).add(float(value))
            if tag not in ("wght", "wdth"):
                notes.append(f"font-variation-settings sets unknown axis {tag}")
    return (min(weights), max(weights)), (min(stretches), max(stretches)), notes


def used_features(css: str) -> set[str]:
    features = set(DEFAULT_FEATURES)
    for v in declarations(css, "font-feature-settings"):
        for tag, value in re.findall(r"""["'](\w{4})["']\s*(on|off|\d+)?""", v):
            if value != "off" and value != "0":
                features.add(tag)
    for v in re.findall(r"(?:font-variant[\w-]*|--tw-[\w-]+)\s*:\s*([^;}]+)", css):
        features |= {VARIANT_FEATURES[w] for w in v.split() if w in VARIANT_FEATURES}
    return features


def axis_limits(font: TTFont, used: dict[str, tuple[float, float]], tight: bool) -> dict[str, tuple[float, float]]:
    limits = {}
    for axis in font["fvar"].axes:
        lo, hi = used[axis.axisTag]
        if not tight:
            lo = axis.defaultValue if lo >= axis.defaultValue else axis.minValue
            hi = axis.defaultValue if hi <= axis.defaultValue else axis.maxValue
        limits[axis.axisTag] = (max(lo, axis.minValue), min(hi, axis.maxValue))
    return limits


def drop_unreachable(font: TTFont, limits: dict[str, tuple[float, float]]) -> None:
    span = {}
    for axis in font["fvar"].axes:
        lo, hi = limits[axis.axisTag]
        below, above = axis.defaultValue - axis.minValue, axis.maxValue - axis.defaultValue
        offsets = (lo - axis.defaultValue, hi - axis.defaultValue)
        span[axis.axisTag] = tuple(d / below if d < 0 else d / above if d > 0 else 0.0 for d in offsets)
        axis.minValue, axis.maxValue = lo, hi

    def reachable(tv) -> bool:
        for tag, (start, peak, end) in tv.axes.items():
            lo, hi = span[tag]
            if not (lo < end and hi > start) and not lo <= peak <= hi:
                return False
        return True

    gvar = font["gvar"]
    for name in font.getGlyphOrder():
        if name in gvar.variations:
            gvar.variations[name] = [tv for tv in gvar.variations[name] if reachable(tv)]


def instance(src: Path, limits: dict[str, tuple[float, float]], tight: bool) -> bytes:
    font = TTFont(src, recalcTimestamp=False)
    if tight:
        font = instancer.instantiateVariableFont(font, limits)
    else:
        drop_unreachable(font, limits)
    font["fvar"].instances = []
    buf = io.BytesIO()
    font.save(buf)
    return buf.getvalue()


def rename(font: TTFont) -> None:
    names = {1: FAMILY, 2: "Regular", 3: f"{FILE_STEM};Version 2.000", 4: FAMILY, 6: FAMILY.replace(" ", "")}
    table = font["name"]
    table.names = [n for n in table.names if n.nameID not in (16, 17, 21, 22, 25)]
    for name_id, value in names.items():
        table.removeNames(nameID=name_id)
        table.setName(value, name_id, 3, 1, 0x409)


def build(instanced: bytes, unicodes: set[int], features: set[str]) -> TTFont:
    font = TTFont(io.BytesIO(instanced), recalcTimestamp=False)
    options = subset.Options()
    options.layout_features = sorted(features)
    options.name_IDs = ["*"]
    options.name_languages = [0x409]
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    rename(font)
    font.flavor = "woff2"
    return font


def unicode_range(codepoints: set[int]) -> str:
    out, cps = [], sorted(codepoints)
    start = prev = cps[0]
    for c in cps[1:] + [None]:
        if c is not None and c == prev + 1:
            prev = c
            continue
        out.append(f"U+{start:04X}" if start == prev else f"U+{start:04X}-{prev:04X}")
        if c is not None:
            start = prev = c
    return ", ".join(out)


def check(path: Path, expected: set[int], limits: dict[str, tuple[float, float]], features: set[str]) -> TTFont:
    font = TTFont(path)
    problems = []
    cmap = set(font.getBestCmap())
    if cmap != expected:
        problems.append(f"cmap differs: missing {sorted(expected - cmap)[:8]}, extra {sorted(cmap - expected)[:8]}")
    axes = {a.axisTag: (a.minValue, a.maxValue) for a in font["fvar"].axes}
    if any(axes.get(tag, span) != span for tag, span in limits.items()):
        problems.append(f"axes are {axes}")
    tags = {r.FeatureTag for t in ("GSUB", "GPOS") if t in font for r in font[t].table.FeatureList.FeatureRecord}
    if extra := tags - features:
        problems.append(f"unexpected features {sorted(extra)}")
    for record in font["name"].names:
        if record.nameID != 0 and "Mona" in record.toUnicode():
            problems.append(f"name {record.nameID} still says {record.toUnicode()!r}")
    if problems:
        sys.exit(f"{path.name}: " + "; ".join(problems))
    return font


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    src = source_font()
    pages, css = read_site()
    tags = set().union(*(p.tags for p in pages.values()))
    wght, wdth, notes = used_axes(css, tags)
    features = used_features(css)
    full = set(TTFont(src).getBestCmap())
    tight = "--tight" in sys.argv
    limits = axis_limits(TTFont(src), {"wght": wght, "wdth": wdth}, tight)

    files = {name: (cmap & full, declared) for name, (cmap, declared) in FILES.items()}
    instanced = instance(src, limits, tight)
    OUT_FONTS.mkdir(parents=True, exist_ok=True)
    for stale in set(OUT_FONTS.glob("*.woff2")) - {OUT_FONTS / f"{FILE_STEM}-{name}.woff2" for name in files}:
        stale.unlink()
    faces = []
    print(f"used: wght {wght[0]:g}-{wght[1]:g}, wdth {wdth[0]:g}-{wdth[1]:g}%, features {' '.join(sorted(features))}")
    print("kept: " + ", ".join(f"{tag} {lo:g}-{hi:g}" for tag, (lo, hi) in limits.items()))
    for note in notes:
        print(f"note: {note}")
    for name, (unicodes, declared) in files.items():
        path = OUT_FONTS / f"{FILE_STEM}-{name}.woff2"
        build(instanced, unicodes, features).save(path)
        font = check(path, unicodes, limits, features)
        print(f"{path.relative_to(ROOT).as_posix()}: {path.stat().st_size} bytes, {font['maxp'].numGlyphs} glyphs, {len(unicodes)} characters")
        faces.append((name, unicode_range(unicodes & declared)))

    blocks = [
        f"""@font-face {{
  font-family: "{FAMILY}";
  font-style: normal;
  font-display: swap;
  font-weight: {limits["wght"][0]:g} {limits["wght"][1]:g};
  font-stretch: {limits["wdth"][0]:g}% {limits["wdth"][1]:g}%;
  src: url(../assets/fonts/{FILE_STEM}-{name}.woff2) format("woff2-variations");
  unicode-range: {urange};
}}"""
        for name, urange in reversed(faces)
    ]
    header = "/* Generated by scripts/subset-fonts.py from Mona Sans (OFL-1.1, Reserved Font Name \"Mona\"). Do not edit. */"
    OUT_CSS.write_text(header + "\n" + "\n\n".join(blocks) + "\n", encoding="utf-8")
    print(f"{OUT_CSS.relative_to(ROOT).as_posix()}: written")

    for page, parsed in pages.items():
        text = "".join(parsed.text)
        chars = {ord(c) for c in text if not c.isspace()}
        loads = []
        for name, (unicodes, declared) in files.items():
            if drawn := sorted(chars & unicodes & declared):
                loads.append(name if name == "core" else f"{name} for {''.join(map(chr, drawn[:20]))}")
            chars -= unicodes & declared
        line = f"{page}: {', '.join(loads) or 'no web font'}"
        if missing := sorted(c for c in chars if unicodedata.category(chr(c))[0] != "C"):
            line += f"; system fallback for {''.join(map(chr, missing[:20]))}"
        if not unicodedata.is_normalized("NFC", text):
            line += "; text is not NFC"
        print(line)


if __name__ == "__main__":
    main()
