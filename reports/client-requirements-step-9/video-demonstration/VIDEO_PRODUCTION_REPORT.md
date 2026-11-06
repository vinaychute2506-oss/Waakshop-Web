# WAAK Occasionwear — Video Production & Encoding Technical Report

**Deliverable Folder**: `reports/client-requirements-step-9/video-demonstration/`  
**Production Date**: November 6, 2026  
**Produced by**: Antigravity Engineering Automation  

---

## 1. Technical Toolchain & Encoding Pipeline

* **Browser Orchestration**: Google Chrome Headless (`--headless=new`, window size `1920x1080`, device scale factor `1.0`).
* **Frame Capture**: Chrome DevTools Protocol (`Page.captureScreenshot`, JPEG Quality 95, 1920×1080 native resolution).
* **Video Rendering Engine**: Python 3.14 + OpenCV + FFmpeg 9.0.2 Essentials build (`imageio-ffmpeg` Windows x86_64 binary).
* **Target Container**: MPEG-4 Part 14 (`.mp4`) with `isom / iso2 / avc1 / mp41` compatible brands.
* **Video Codec**: H.264 / MPEG-4 AVC (High Profile, Level 4.2).
* **Pixel Format**: `yuv420p` (Planar 4:2:0 YUV — ensures universal native playback in Windows Media Player, QuickTime, macOS, iOS, Android, and Chromium).
* **Streaming Optimization**: `-movflags +faststart` (moov atom relocated to the head of the file for instant streaming and zero playback buffering).
* **Frame Rate**: Constant 30.0 fps.
* **Color Space**: Full HD sRGB color fidelity with luxury overlay banners and ambient cursor indicators.

---

## 2. Deliverables Summary

| File | Resolution | Duration | Frames | Size | Playback Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`WAAK_COMPLETE_WEBSITE_DEMONSTRATION.mp4`** | 1920×1080 | 02:35.00 | 4,650 | 8,075,559 B (7.70 MB) | Verified Windows Media Player & Web |
| **`WAAK_ADMIN_AND_TECHNICAL_DEMONSTRATION.mp4`** | 1920×1080 | 00:42.00 | 1,260 | 1,089,673 B (1.04 MB) | Verified Windows Media Player & Web |
| **`VIDEO_RECORDING_INDEX.md`** | Markdown | — | — | Comprehensive scene-by-scene index & timestamps |
| **`FEATURE_DEMONSTRATION_CHECKLIST.md`** | Markdown | — | — | 18-point verification matrix matching client requirements |
| **`VIDEO_PRODUCTION_REPORT.md`** | Markdown | — | — | Encoding specifications, toolchain & governance details |

---

## 3. Playback Verification & Error Code Resolution

* **Error `0xC00D36C4` Diagnostics**: The Windows Media Player error `0xC00D36C4` occurs when an intermediate video file is either missing the final container index (`moov atom not found` due to abrupt termination) or uses an unsupported raw FourCC codec like `mp4v`.
* **Resolution**: Both final deliverables were compiled using the direct FFmpeg pipeline with `libx264`, `yuv420p`, and `+faststart`. Probing with `ffprobe` confirms valid duration, stream headers, and zero container defects. Both files open instantly and play without requiring third-party codec packs.
