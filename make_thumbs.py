import os
from pathlib import Path

from PIL import Image

# --------- CONFIGURE THIS ---------
# Root folder where your coloring images live
ROOT = Path("assets/coloring")  # adjust if needed

# Max width for thumbnails (height auto-calculated)
MAX_WIDTH = 450

# WEBP quality (0–100, 60–80 is usually great)
WEBP_QUALITY = 70
# ----------------------------------


def is_logo_image(path: Path) -> bool:
    """Avoid compressing your logo / branding assets."""
    lower = str(path).lower()
    return "logo" in lower


def make_thumbnail(img_path: Path) -> None:
    """
    Create a WEBP thumbnail next to the original image.

    e.g. animals-cat.png -> animals-cat-thumb.webp
    """
    # Skip logo/branding images
    if is_logo_image(img_path):
        print(f"Skipping logo/branding image: {img_path}")
        return

    thumb_name = img_path.stem + "-thumb.webp"
    thumb_path = img_path.with_name(thumb_name)

    if thumb_path.exists():
        print(f"Thumbnail already exists, skipping: {thumb_path}")
        return

    try:
        with Image.open(img_path) as im:
            im.load()

            # Convert to RGB so WEBP saves cleanly
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")

            width, height = im.size

            # Resize only if wider than MAX_WIDTH
            if width > MAX_WIDTH:
                new_height = int(height * (MAX_WIDTH / float(width)))
                im = im.resize((MAX_WIDTH, new_height), Image.LANCZOS)

            # Save as WEBP
            im.save(
                thumb_path,
                "WEBP",
                quality=WEBP_QUALITY,
                method=6,  # better compression
            )

        print(f"Created thumbnail: {thumb_path}")

    except Exception as e:
        print(f"Error processing {img_path}: {e}")


def main():
    if not ROOT.exists():
        print(f"Root folder does not exist: {ROOT}")
        return

    exts = (".png", ".jpg", ".jpeg")

    files_found = 0
    for img_path in ROOT.rglob("*"):
        if img_path.suffix.lower() in exts and img_path.is_file():
            files_found += 1
            make_thumbnail(img_path)

    print(f"\nDone. Processed {files_found} image(s).")


if __name__ == "__main__":
    main()
