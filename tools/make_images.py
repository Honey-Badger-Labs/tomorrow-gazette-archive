#!/usr/bin/env python3
"""Makes the site's optimised images from the show's own production stills.

Every picture on the site is one of our AI-made Vera, DOT or studio stills,
cropped and saved as WebP (served first) with a JPEG fallback, at a few
widths; flat transparent artwork (masthead, sunburst) is an indexed PNG, so phones download small files. Run it again after changing a crop:

    python3 tools/make_images.py /path/to/production-repo

The sources live in the private production repo, so they aren't committed
here. Needs Pillow with WebP support. Each output must stay under 200 KB.
"""
import sys
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "assets" / "img"
LIMIT = 200 * 1024

# name: (source path in the production repo, crop box or None, widths, fallback format)
IMAGES = {
    "studio-twoshot": ("package/set/twoshot_16x9_v1.png", None, [640, 1024, 1600], "jpg"),
    "studio-set": ("package/set/studio_wide_16x9_v1.png", None, [640, 1024], "jpg"),
    "vera-avatar": ("package/set/twoshot_16x9_v1.png", (960, 120, 1600, 760), [160, 320], "jpg"),
    "dot-avatar": ("package/set/twoshot_16x9_v1.png", (420, 270, 1000, 850), [160, 320], "jpg"),
    "vera-portrait": ("package/characters/vera/vera_16x9_camera_v1.png", (744, 0, 1944, 1200), [480, 800], "jpg"),
    "dot-portrait": ("package/characters/dot/dot_desk_16x9_v1.png", (880, 120, 1780, 1020), [480, 800], "jpg"),
    "e1-flying-car": ("e1/stills/P3.png", (0, 110, 752, 533), [480, 752], "jpg"),
    "e2-robot-housemaid": ("e2/stills/E2S2.png", (0, 4, 2688, 1516), [480, 752], "jpg"),
    "masthead": ("package/masthead/tg_masthead_type_notag_transparent.png", (167, 459, 2833, 1245), [420, 840], "png"),
    "sunburst": ("package/masthead/tg_sunburst_brass_transparent.png", None, [900], "png"),
}


def save(im, path, fmt):
    """Saves at the best quality that keeps the file under LIMIT."""
    for quality in (82, 76, 70, 64, 58, 50):
        if fmt == "webp":
            im.save(path, "WEBP", quality=quality, method=6)
        elif fmt == "jpg":
            im.convert("RGB").save(path, "JPEG", quality=quality, optimize=True, progressive=True)
        else:
            im.quantize(colors=128 if quality > 64 else 64, method=Image.Quantize.FASTOCTREE).save(path, "PNG", optimize=True)
        if path.stat().st_size <= LIMIT:
            return path.stat().st_size
    raise SystemExit(f"{path.name} is still over {LIMIT // 1024} KB")


def main(root):
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, box, widths, fallback) in IMAGES.items():
        im = Image.open(Path(root) / src)
        im = im.convert("RGBA" if fallback == "png" else "RGB")
        if box:
            im = im.crop(box)
        for width in widths:
            height = round(im.height * width / im.width)
            sized = im.resize((width, height), Image.LANCZOS)
            # Transparent artwork with few colours is smaller as an indexed PNG.
            for fmt in ((fallback,) if fallback == "png" else ("webp", fallback)):
                path = OUT / f"{name}-{width}.{fmt}"
                size = save(sized, path, fmt)
                print(f"{path.relative_to(OUT.parent.parent)}  {width}x{height}  {size // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
