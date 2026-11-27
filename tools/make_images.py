#!/usr/bin/env python3
"""Makes the site's optimised images from the show's own production stills.

Every picture on the site is one of our AI-made Vera, DOT or studio stills,
cropped and saved as WebP (served first) with a JPEG fallback, at a few
widths; flat transparent artwork (masthead, sunburst) is an indexed PNG, so phones download small files. Run it again after changing a crop:

    python3 tools/make_images.py /path/to/production-repo
    python3 tools/make_images.py --journey /path/to/journey/stills
    python3 tools/make_images.py --telegraph /path/to/photos-by-telegraph

The sources live in the private production repo, so they aren't committed
here. Needs Pillow with WebP support. Each output must stay under 200 KB.
Journey stop stills (the 16:9 night-sky series) are rebuilt with --journey
from the local workshop stills folder, not from the production repo.
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
    "e3-mail-by-missile": ("e3/stills/E3S1.png", (0, 4, 2688, 1516), [480, 752], "jpg"),
    "e4-pan-am-moon": ("e4/short/thumbnail_published_tickets_moon.jpg", None, [480, 752], "jpg"),
    "e6-too-cheap-to-meter": ("e6/stills/S3_meter_2026_3d10e951.png", (0, 700, 1520, 1555), [480, 752], "jpg"),
    # Voyager still is the J10 night-sky still (Higgsfield, 1344x752), copied to this path.
    "special-voyager-light-day": ("specials/voyager-light-day/stills/J10_1977_voyager_golden_record_6a1400ce.png", None, [480, 752], "jpg"),
    # E7 episode card is the same 16:9 still as telegraph-e7-herbert-simon
    # (workshop file 15_e7_herbert_simon.png); rebuild those 480/752 sizes together.
    "special-italys-champions": ("specials/italy-f1/stills/S8.png", (0, 880, 1152, 1528), [480, 752], "jpg"),
    "hw-2026-spirit-phone": ("specials/halloween-2026/stills/H3.png", (0, 240, 752, 663), [480, 752], "jpg"),
    # The portrait Jakes supplied, with the top-right screen label changed to "Tomorrow".
    "jakes-portrait": ("package/people/jakes_portrait_clean_v1.png", None, [480, 752], "jpg"),
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


# Journey Through Tomorrow stop stills. Filenames are the 21 Nov 2026
# Higgsfield outputs (16:9 1344x752). Only aired stops are built; intro,
# outro, the 9:16 poster, and predictions without a published archive
# page are left out on purpose.
JOURNEY_STILLS = {
    "journey-snapshots-by-telegraph": "J01_1900_snapshots_by_telegraph_f1ca8f4e.png",
    "journey-spirit-phone": "J02_1920_spirit_phone_afbeb4d9.png",
    "journey-flying-car": "J04_1940_flying_car_740ffb7f.png",
    "journey-mail-by-missile": "J06_1959_mail_by_missile_eb966d32.png",
    "journey-robot-housemaid": "J08_1964_robot_housemaid_3e1041ae.png",
    "journey-moon-airliner": "J09_1964_moon_airliner_edfdf980.png",
}


def make_journey(src_dir):
    root = Path(src_dir)
    OUT.mkdir(parents=True, exist_ok=True)
    widths = [480, 752]
    for name, fname in JOURNEY_STILLS.items():
        im = Image.open(root / fname).convert("RGB")
        for width in widths:
            height = round(im.height * width / im.width)
            sized = im.resize((width, height), Image.LANCZOS)
            for fmt in ("webp", "jpg"):
                path = OUT / f"{name}-{width}.{fmt}"
                size = save(sized, path, fmt)
                print(f"{path.relative_to(OUT.parent.parent)}  {width}x{height}  {size // 1024} KB")


# Photos by Telegraph collage stills. Sources live in the local workshop
# folder (portraits, episode throwbacks and the three 27 Nov 2026 specials).
# Layouts: square portraits at 480/800; vertical portraits at 480/800;
# 16:9 stills at 480/752/1280 so the lightbox can open a crisp full view.
TELEGRAPH_STILLS = {
    "telegraph-vera-profile": "01_vera_profile.jpg",
    "telegraph-dot-profile": "02_dot_profile.jpg",
    "telegraph-vera-bw": "03_vera_bw.png",
    "telegraph-vera-fullbody": "04_vera_fullbody_color.png",
    "telegraph-vera-desk": "05_vera_desk_hero.png",
    "telegraph-dot-desk": "06_dot_desk_hero.png",
    "telegraph-vera-desk-vertical": "07_vera_profile_desk_vertical.png",
    "telegraph-dot-desk-vertical": "08_dot_profile_desk_vertical.png",
    "telegraph-e1-flying-car": "09_e1_flying_car.png",
    "telegraph-e2-robot-housemaid": "10_e2_robot_housemaid.png",
    "telegraph-e3-mail-by-rocket": "11_e3_mail_by_rocket.png",
    "telegraph-e4-pan-am-moon": "12_e4_pan_am_moon.png",
    "telegraph-e5-snapshots": "13_e5_snapshots_by_telegraph.png",
    "telegraph-e6-too-cheap-to-meter": "14_e6_too_cheap_to_meter.png",
    "telegraph-e7-herbert-simon": "15_e7_herbert_simon.png",
    "telegraph-vera-dot-twoshot": "16_vera_dot_studio_twoshot.png",
    "telegraph-beach-sandcastle": "new_01_beach_vera_dot.png",
    "telegraph-flying-roadster": "new_02_tesla_roadster_vera_dot.png",
    "telegraph-sub-rocket": "new_03_sub_rocket_launch.png",
}


def telegraph_widths(im):
    ratio = im.width / im.height
    if ratio >= 1.3:
        return [480, 752, 1280]
    return [480, 800]


def make_telegraph(src_dir):
    root = Path(src_dir)
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fname in TELEGRAPH_STILLS.items():
        im = Image.open(root / fname).convert("RGB")
        widths = telegraph_widths(im)
        for width in widths:
            height = round(im.height * width / im.width)
            sized = im.resize((width, height), Image.LANCZOS)
            for fmt in ("webp", "jpg"):
                path = OUT / f"{name}-{width}.{fmt}"
                size = save(sized, path, fmt)
                print(f"{path.relative_to(OUT.parent.parent)}  {width}x{height}  {size // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--journey":
        make_journey(sys.argv[2])
    elif len(sys.argv) == 3 and sys.argv[1] == "--telegraph":
        make_telegraph(sys.argv[2])
    elif len(sys.argv) == 2 and sys.argv[1] not in ("--journey", "--telegraph"):
        main(sys.argv[1])
    else:
        raise SystemExit(__doc__)
