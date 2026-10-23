#!/usr/bin/env python3
"""Render Tapza Care's vector-inspired launcher artwork to native PNG sizes (stdlib only)."""

from __future__ import annotations

import math
import shutil
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRAND_START = (15, 118, 110)
BRAND_END = (17, 94, 89)
BADGE = (247, 251, 249)
TEAL = (15, 118, 110)
AMBER = (245, 158, 11)


def rounded_rect(x: float, y: float, left: float, top: float, right: float, bottom: float, radius: float) -> bool:
    cx = (left + right) / 2
    cy = (top + bottom) / 2
    half_w = (right - left) / 2 - radius
    half_h = (bottom - top) / 2 - radius
    dx = abs(x - cx) - half_w
    dy = abs(y - cy) - half_h
    return math.hypot(max(dx, 0), max(dy, 0)) + min(max(dx, dy), 0) <= radius


def segment_distance(x: float, y: float, a: tuple[float, float], b: tuple[float, float]) -> float:
    vx, vy = b[0] - a[0], b[1] - a[1]
    denom = vx * vx + vy * vy
    t = 0 if denom == 0 else max(0, min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / denom))
    return math.hypot(x - (a[0] + t * vx), y - (a[1] + t * vy))


def over(bottom: tuple[float, float, float], top: tuple[int, int, int], alpha: float) -> tuple[float, float, float]:
    return tuple(bottom[i] * (1 - alpha) + top[i] * alpha for i in range(3))


def sample_icon(x: float, y: float, diwali: bool = False) -> tuple[int, int, int, int]:
    brand_start, brand_end = ((59, 7, 100), (124, 45, 18)) if diwali else (BRAND_START, BRAND_END)
    badge, teal, amber = ((255, 247, 237), (154, 52, 18), (217, 119, 6)) if diwali else (BADGE, TEAL, AMBER)
    mix = max(0, min(1, (x + y) / 2048))
    color: tuple[float, float, float] = tuple(
        brand_start[i] * (1 - mix) + brand_end[i] * mix for i in range(3)
    )

    # Soft offset shadow beneath the badge.
    distance = math.hypot(x - 512, y - 508)
    if distance > 318:
        shadow = max(0, min(1, (352 - distance) / 34)) ** 2 * 0.23
        color = over(color, (0, 32, 30), shadow)

    # Deep teal halo, then the warm white circular medical badge.
    if math.hypot(x - 512, y - 512) <= 344:
        color = over(color, (8, 93, 87), 0.55)
    if math.hypot(x - 512, y - 494) <= 318:
        color = badge

    cross = rounded_rect(x, y, 443, 303, 581, 685, 18) or rounded_rect(
        x, y, 303, 425, 721, 563, 18
    )
    if cross and math.hypot(x - 512, y - 494) <= 318:
        color = teal

    pulse = ((326, 510), (437, 510), (488, 416), (552, 596), (604, 510), (698, 510))
    if any(segment_distance(x, y, pulse[i], pulse[i + 1]) <= 17 for i in range(len(pulse) - 1)):
        if math.hypot(x - 512, y - 494) <= 318:
            color = amber
    if diwali:
        # A simple festive diya flame above the medical cross keeps the mark recognizable.
        flame = math.hypot((x - 512) / 0.72, y - 238) <= 42 and y < 260
        if flame:
            color = amber
    return (round(color[0]), round(color[1]), round(color[2]), 255)


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)


def render(size: int, target: Path, diwali: bool = False) -> None:
    scale = 1024 / size
    rows = bytearray()
    samples = (0.25, 0.75)
    for py in range(size):
        rows.append(0)  # PNG filter: None
        for px in range(size):
            rgba = [0, 0, 0, 0]
            for sy in samples:
                for sx in samples:
                    color = sample_icon((px + sx) * scale, (py + sy) * scale, diwali)
                    for channel in range(4):
                        rgba[channel] += color[channel] / 4
            rows.extend(round(channel) for channel in rgba)
    header = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", header) + png_chunk(b"IDAT", zlib.compress(bytes(rows), 9)) + png_chunk(b"IEND", b""))


def main() -> None:
    ios_sizes = {
        "AppIcon-iPad-20.png": 20,
        "AppIcon-20@2x.png": 40,
        "AppIcon-20@3x.png": 60,
        "AppIcon-iPad-29.png": 29,
        "AppIcon-29@2x.png": 58,
        "AppIcon-29@3x.png": 87,
        "AppIcon-iPad-40.png": 40,
        "AppIcon-40@2x.png": 80,
        "AppIcon-40@3x.png": 120,
        "AppIcon-iPad-76.png": 76,
        "AppIcon-iPad-76@2x.png": 152,
        "AppIcon-iPad-83.5@2x.png": 167,
        "AppIcon-60@2x.png": 120,
        "AppIcon-60@3x.png": 180,
        "AppIcon-1024.png": 1024,
    }
    ios_dir = ROOT / "ios/TapzaCare/Images.xcassets/AppIcon.appiconset"
    for filename, size in ios_sizes.items():
        render(size, ios_dir / filename)

    diwali_ios_dir = ROOT / "ios/TapzaCare/Images.xcassets/AppIconDiwali.appiconset"
    for filename, size in ios_sizes.items():
        render(size, diwali_ios_dir / filename, diwali=True)
    (diwali_ios_dir / "Contents.json").write_text((ios_dir / "Contents.json").read_text())

    android_sizes = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
    for density, size in android_sizes.items():
        for name in ("ic_launcher.png", "ic_launcher_round.png"):
            render(size, ROOT / f"android/app/src/main/res/mipmap-{density}/{name}")
            diwali_name = name.replace("ic_launcher", "ic_launcher_diwali")
            render(size, ROOT / f"android/app/src/main/res/mipmap-{density}/{diwali_name}", diwali=True)

    shutil.copyfile(ios_dir / "AppIcon-1024.png", ROOT / "assets/branding/tapza-care-app-icon.png")
    shutil.copyfile(
        diwali_ios_dir / "AppIcon-1024.png",
        ROOT / "assets/branding/tapza-care-app-icon-diwali.png",
    )


if __name__ == "__main__":
    main()
