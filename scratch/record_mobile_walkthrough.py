import subprocess
import time
import json
import urllib.request
import asyncio
import websockets
import base64
import os
import io
from PIL import Image

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"C:\Users\Takemichi\.gemini\antigravity\brain\755e5651-9ae8-440d-b3d7-aa3553699cc2\scratch\mobile_frames"
ARTIFACT_DIR = r"C:\Users\Takemichi\.gemini\antigravity\brain\755e5651-9ae8-440d-b3d7-aa3553699cc2"
PUBLIC_DIR = r"c:\Users\Takemichi\Desktop\Waak Shop Web\public\assets"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

frames = []

async def send_cmd(ws, msg_id, method, params=None):
    payload = {"id": msg_id, "method": method}
    if params:
        payload["params"] = params
    await ws.send(json.dumps(payload))

async def record():
    # 1. Launch Chrome in mobile viewport dimensions (iPhone 14/15 size 390x844)
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9223",
        "--window-size=390,844",
        "--hide-scrollbars",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "http://localhost:5173/"
    ]
    print("Launching Chrome in mobile viewport (390x844)...")
    proc = subprocess.Popen(cmd)
    await asyncio.sleep(2.5)

    try:
        # 2. Get WebSocket URL for the 5173 tab
        tabs = []
        for _ in range(10):
            try:
                with urllib.request.urlopen("http://localhost:9223/json") as resp:
                    tabs = json.loads(resp.read().decode())
                    if tabs:
                        break
            except Exception:
                await asyncio.sleep(0.5)

        target_tab = None
        for t in tabs:
            if "5173" in t.get("url", ""):
                target_tab = t
                break
        if not target_tab and tabs:
            target_tab = tabs[0]

        if not target_tab:
            raise RuntimeError("Could not find active Chrome tab on port 9223")

        ws_url = target_tab["webSocketDebuggerUrl"]
        print(f"Connected to Chrome DevTools Protocol at {ws_url}")

        async with websockets.connect(ws_url, max_size=50_000_000) as ws:
            msg_id = 1

            # Enable Page, Runtime & Emulation
            await send_cmd(ws, msg_id, "Page.enable"); msg_id += 1
            await send_cmd(ws, msg_id, "Runtime.enable"); msg_id += 1

            # Configure Mobile Device Emulation (iPhone 14 / Pro: 390 x 844, scale factor 2)
            await send_cmd(ws, msg_id, "Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True,
                "fitWindow": False
            }); msg_id += 1

            await send_cmd(ws, msg_id, "Emulation.setTouchEmulationEnabled", {
                "enabled": True,
                "maxTouchPoints": 5
            }); msg_id += 1

            # Start Mobile Screencast (high quality, native portrait frame)
            await send_cmd(ws, msg_id, "Page.startScreencast", {
                "format": "jpeg",
                "quality": 85,
                "maxWidth": 390,
                "maxHeight": 844,
                "everyNthFrame": 1
            }); msg_id += 1

            print("Mobile screencast stream active. Executing mobile journey script...")

            # Mobile Interaction Timeline Script
            interactions = [
                # 0s - 3.2s: Theatrical curtain opening on mobile
                {"delay": 3.2, "action": "console.log('Mobile curtain reveal complete');"},

                # 3.2s - 4.8s: Smooth mobile scroll down to Category Circles & New Arrivals
                {"delay": 1.6, "action": "window.scrollTo({ top: 480, behavior: 'smooth' });"},

                # 4.8s - 6.5s: Continue scroll to first signature card
                {"delay": 1.7, "action": "window.scrollTo({ top: 780, behavior: 'smooth' });"},

                # 6.5s - 8.2s: Tap on first product card (Ivory Zardozi Sherwani)
                {"delay": 1.7, "action": """
                    const card = document.querySelector('.new-arrival-card') || document.querySelector('[data-product-id="waak-01"]') || document.querySelector('.product-card');
                    if (card) card.click();
                    else {
                        const anyImg = document.querySelector('img[alt*="Ivory"]') || document.querySelector('img[alt*="Sherwani"]');
                        if (anyImg && anyImg.closest('.clickable, button, div')) anyImg.click();
                    }
                """},

                # 8.2s - 10.5s: In Mobile PDP, scroll slightly to reveal size selectors and PIN checker
                {"delay": 2.3, "action": """
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                """},

                # 10.5s - 12.2s: Select Size 40
                {"delay": 1.7, "action": """
                    const sizeBtns = Array.from(document.querySelectorAll('button'));
                    const size40 = sizeBtns.find(b => b.textContent && b.textContent.trim() === '40');
                    if (size40) size40.click();
                """},

                # 12.2s - 14.5s: Fill delivery PIN code and check
                {"delay": 2.3, "action": """
                    const pinInput = document.querySelector('input[placeholder*="PIN"]') || document.querySelector('input[type="text"]');
                    if (pinInput) {
                        pinInput.value = '110001';
                        pinInput.dispatchEvent(new Event('input', { bubbles: true }));
                        pinInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    const checkBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim().toLowerCase().includes('check'));
                    if (checkBtn) checkBtn.click();
                """},

                # 14.5s - 16.5s: Tap Add to Bag on sticky bar
                {"delay": 2.0, "action": """
                    const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Add to Bag'));
                    if (addBtns.length > 0) {
                        // Click the mobile sticky or primary button
                        addBtns[addBtns.length - 1].click();
                    }
                """},

                # 16.5s - 19.0s: In mobile Cart Drawer, step quantity to 2
                {"delay": 2.5, "action": """
                    const cartPlusBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.trim() === '+');
                    if (cartPlusBtns.length > 0) {
                        cartPlusBtns[cartPlusBtns.length - 1].click();
                    }
                """},

                # 19.0s - 21.0s: Close Cart Drawer
                {"delay": 2.0, "action": """
                    const closeBtn = document.querySelector('button[aria-label="Close cart"]') || document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent === '✕' || b.textContent === '×');
                    if (closeBtn) closeBtn.click();
                """},

                # 21.0s - 23.0s: Scroll down to inspect mobile policy and accordion content
                {"delay": 2.0, "action": "window.scrollTo({ top: 900, behavior: 'smooth' });"},

                # 23.0s - 25.0s: Return home by tapping brand logo
                {"delay": 2.0, "action": """
                    const logo = document.querySelector('.navbar-center') || document.querySelector('nav img') || document.querySelector('header a');
                    if (logo) logo.click();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                """},

                # Final settling frame
                {"delay": 1.5, "action": "console.log('Mobile walkthrough recording complete');"}
            ]

            frame_count = 0
            start_time = time.time()
            recording = True

            async def handle_incoming():
                nonlocal frame_count, recording
                while recording:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=0.5)
                        msg = json.loads(raw)
                        if msg.get("method") == "Page.screencastFrame":
                            session_id = msg["params"]["sessionId"]
                            b64data = msg["params"]["data"]
                            img_bytes = base64.b64decode(b64data)

                            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                            frames.append(img)
                            frame_count += 1

                            await send_cmd(ws, 9999, "Page.screencastFrameAck", {"sessionId": session_id})
                    except asyncio.TimeoutError:
                        continue
                    except Exception:
                        break

            recv_task = asyncio.create_task(handle_incoming())

            for step in interactions:
                await asyncio.sleep(step["delay"])
                await send_cmd(ws, msg_id, "Runtime.evaluate", {"expression": step["action"]})
                msg_id += 1

            await asyncio.sleep(1.5)
            recording = False
            await recv_task

            await send_cmd(ws, msg_id, "Page.stopScreencast")
            print(f"Captured {len(frames)} mobile frames across {time.time() - start_time:.1f} seconds.")

    finally:
        proc.terminate()

    # 3. Compile Mobile Animations
    if frames:
        print("Compiling mobile screen recording into high-fidelity WebP and GIF animations...")

        # Subsample to ~12 FPS for smooth mobile playback (target ~100-130 frames total)
        step = max(1, len(frames) // 120)
        selected_frames = frames[::step]
        print(f"Selected {len(selected_frames)} mobile frames (step={step}).")

        TARGET_SIZE = (390, 844)
        uniform_frames = [f.resize(TARGET_SIZE, Image.Resampling.LANCZOS) for f in selected_frames]
        print(f"Normalized all {len(uniform_frames)} frames to exact target dimensions {TARGET_SIZE}.")

        # Save Animated WebP (Full 24-bit color, superior mobile compression)
        webp_path_artifact = os.path.join(ARTIFACT_DIR, "waak_mobile_walkthrough.webp")
        webp_path_public = os.path.join(PUBLIC_DIR, "waak-mobile-walkthrough.webp")

        uniform_frames[0].save(
            webp_path_artifact,
            save_all=True,
            append_images=uniform_frames[1:],
            duration=120,
            loop=0,
            quality=85
        )
        uniform_frames[0].save(
            webp_path_public,
            save_all=True,
            append_images=uniform_frames[1:],
            duration=120,
            loop=0,
            quality=85
        )
        print(f"✓ Saved Mobile WebP Video: {webp_path_artifact} ({os.path.getsize(webp_path_artifact) // 1024} KB)")

        # Save Animated GIF (Universal compatibility)
        gif_path_artifact = os.path.join(ARTIFACT_DIR, "waak_mobile_walkthrough.gif")
        gif_path_public = os.path.join(PUBLIC_DIR, "waak-mobile-walkthrough.gif")

        # Resize slightly for GIF palette efficiency (390x844 -> 320x692)
        gif_frames = [f.resize((320, 692), Image.Resampling.LANCZOS) for f in selected_frames]
        gif_frames[0].save(
            gif_path_artifact,
            save_all=True,
            append_images=gif_frames[1:],
            duration=120,
            loop=0,
            optimize=True
        )
        gif_frames[0].save(
            gif_path_public,
            save_all=True,
            append_images=gif_frames[1:],
            duration=120,
            loop=0,
            optimize=True
        )
        print(f"✓ Saved Mobile GIF Video: {gif_path_artifact} ({os.path.getsize(gif_path_artifact) // 1024} KB)")

if __name__ == "__main__":
    asyncio.run(record())
