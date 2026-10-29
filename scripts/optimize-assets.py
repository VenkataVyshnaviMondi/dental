"""Convert production PNGs to WebP without cropping or changing their composition.

Development utility only; Pillow is not required to run the site.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
names = ["hero-cutout", "hero-background", "dental-care", "smile-comparison", "treatments", "appointment-light", "avatars"]
original = optimized = 0
for name in names:
    source = root / "assets" / f"{name}.png"
    target = source.with_suffix(".webp")
    with Image.open(source) as image:
        image.save(target, "WEBP", quality=91, method=6, exact=True)
    original += source.stat().st_size
    optimized += target.stat().st_size
for filename in ["index.html", "styles.css"]:
    target = root / filename
    content = target.read_text(encoding="utf-8")
    for name in names:
        content = content.replace(f"assets/{name}.png", f"assets/{name}.webp")
    target.write_text(content, encoding="utf-8")
print(f"Production images: {original:,} -> {optimized:,} bytes ({100 * (1 - optimized/original):.1f}% smaller)")
