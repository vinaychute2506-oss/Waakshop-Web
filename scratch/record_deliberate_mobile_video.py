import subprocess
import time
import json
import urllib.request
import asyncio
import websockets
import base64
import os
import io
import sys
import shutil
from PIL import Image

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
ARTIFACT_DIR = r"C:\Users\Takemichi\.gemini\antigravity\brain\755e5651-9ae8-440d-b3d7-aa3553699cc2"
PUBLIC_DIR = r"c:\Users\Takemichi\Desktop\Waak Shop Web\public\assets"
PROFILE_DIR = r"c:\Users\Takemichi\Desktop\Waak Shop Web\scratch\chrome_profile"

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(PROFILE_DIR, exist_ok=True)

def log(msg):
    print(msg)
    sys.stdout.flush()

async def send_cmd(ws, msg_id, method, params=None):
    payload = {"id": msg_id, "method": method}
    if params:
        payload["params"] = params
    await ws.send(json.dumps(payload))

async def send_cmd_and_wait(ws, get_next_id, method, params=None):
    cid = get_next_id()
    payload = {"id": cid, "method": method}
    if params:
        payload["params"] = params
    await ws.send(json.dumps(payload))
    while True:
        raw = await ws.recv()
        parsed = json.loads(raw)
        if parsed.get("id") == cid:
            return parsed

async def record_and_encode():
    # 1. Launch Chrome in dedicated portrait viewport (390x844)
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9228",
        f"--user-data-dir={PROFILE_DIR}",
        "--window-size=390,844",
        "--hide-scrollbars",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "http://localhost:5173/"
    ]
    log("[1/4] Launching headless Chrome in mobile viewport (390x844)...")
    proc = subprocess.Popen(cmd)
    await asyncio.sleep(2.5)

    captured_frames = []

    try:
        # 2. Connect to Chrome CDP
        tabs = []
        for _ in range(12):
            try:
                with urllib.request.urlopen("http://localhost:9228/json") as resp:
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

        ws_url = target_tab["webSocketDebuggerUrl"]
        log(f"[2/4] Connected to CDP at {ws_url}")

        async with websockets.connect(ws_url, max_size=200_000_000) as ws:
            msg_counter = 1
            def next_id():
                nonlocal msg_counter
                cid = msg_counter
                msg_counter += 1
                return cid

            await send_cmd(ws, next_id(), "Page.enable")
            await send_cmd(ws, next_id(), "Runtime.enable")

            # Emulate iPhone 14/15 mobile screen
            await send_cmd(ws, next_id(), "Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True,
                "fitWindow": False
            })

            await send_cmd(ws, next_id(), "Emulation.setTouchEmulationEnabled", {
                "enabled": True,
                "maxTouchPoints": 5
            })

            # Start Screencast capture
            await send_cmd(ws, next_id(), "Page.startScreencast", {
                "format": "jpeg",
                "quality": 85,
                "maxWidth": 390,
                "maxHeight": 844,
                "everyNthFrame": 1
            })

            log("[3/4] Recording deliberate luxury walkthrough (approx 95s, calm pacing)...")

            # Calm, deliberate sequence of interactions
            interactions = [
                # SCENE 1: Theatrical Curtain Reveal & Hero (0s - 7s)
                {"delay": 4.5, "action": "console.log('Scene 1: Velvet curtains parting');"},
                {"delay": 2.5, "action": "console.log('Scene 1: Savoring mobile hero headline');"},

                # SCENE 2: Patron Login & Authenticated Dashboard (7s - 21s)
                {"delay": 1.5, "action": """
                    window.history.pushState({}, '', '/account');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                """},
                {"delay": 2.5, "action": """
                    const emailInput = document.querySelector('input[type="email"]') || document.querySelectorAll('input')[0];
                    const passInput = document.querySelector('input[type="password"]') || document.querySelectorAll('input')[1];
                    if (emailInput && passInput) {
                        emailInput.value = 'raghav.mehra@waak.in';
                        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                        passInput.value = 'securePassword2026!';
                        passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                """},
                {"delay": 2.0, "action": """
                    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent.includes('Sign In') || b.textContent.includes('Login') || b.type === 'submit'
                    );
                    if (submitBtn) submitBtn.click();
                """},
                # Hold 5.0s on Authenticated Patron Dashboard (Raghav Mehra, Mehrauli 110001)
                {"delay": 5.0, "action": "console.log('Scene 2: Viewing verified patron dashboard & saved address');"},

                # SCENE 3: Storefront Browsing & Product Discovery (21s - 34s)
                {"delay": 1.5, "action": """
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                """},
                {"delay": 2.5, "action": "console.log('Scene 3: Viewing luxury brand insignia');"},
                {"delay": 1.5, "action": "window.scrollTo({ top: 400, behavior: 'smooth' });"},
                # Hold 3.5s on category circles (Sherwanis, Kurta Sets, Indo-Western)
                {"delay": 3.5, "action": "console.log('Scene 3: Inspecting category circles');"},
                {"delay": 1.5, "action": "window.scrollTo({ top: 780, behavior: 'smooth' });"},
                # Hold 3.5s on Ivory Zardozi Sherwani product card (₹49,500)
                {"delay": 3.5, "action": "console.log('Scene 3: Admiring The Ivory Zardozi Sherwani card');"},
                {"delay": 1.5, "action": """
                    const card = document.querySelector('.new-arrival-card') || document.querySelector('[data-product-id="waak-01"]') || document.querySelector('.product-card');
                    if (card) card.click();
                """},

                # SCENE 4: Product Detail Page, Sizing Modal & PIN Checker (34s - 56s)
                {"delay": 3.0, "action": "window.scrollTo({ top: 380, behavior: 'smooth' });"},
                {"delay": 2.5, "action": "console.log('Scene 4: Inspecting editorial silhouette');"},
                # Open Size Guide Modal
                {"delay": 1.5, "action": """
                    const guideBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent && b.textContent.toLowerCase().includes('size guide')
                    );
                    if (guideBtn) guideBtn.click();
                """},
                # Hold 5.0s on Size Guide Modal so viewer can clearly read measurements table
                {"delay": 5.0, "action": "console.log('Scene 4: Reading size guide measurements table (38, 40, 42, 44)');"},
                # Close Size Guide Modal
                {"delay": 1.5, "action": """
                    const closeGuide = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent === '✕' || b.textContent === '×' || b.getAttribute('aria-label') === 'Close size guide'
                    );
                    if (closeGuide) closeGuide.click();
                """},
                # Select chest size 40
                {"delay": 2.0, "action": """
                    const sizeBtns = Array.from(document.querySelectorAll('button'));
                    const size40 = sizeBtns.find(b => b.textContent && b.textContent.trim() === '40');
                    if (size40) size40.click();
                """},
                # Hold 3.0s on active size 40 selection
                {"delay": 3.0, "action": "console.log('Scene 4: Size 40 selected, live stock verified');"},
                # Enter PIN code 110001
                {"delay": 1.5, "action": """
                    const pinInput = document.querySelector('input[placeholder*="PIN"]') || document.querySelector('input[type="text"]');
                    if (pinInput) {
                        pinInput.value = '110001';
                        pinInput.dispatchEvent(new Event('input', { bubbles: true }));
                        pinInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                """},
                # Click "Check" on PIN
                {"delay": 1.5, "action": """
                    const checkBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent && b.textContent.trim().toLowerCase().includes('check')
                    );
                    if (checkBtn) checkBtn.click();
                """},
                # Hold 4.0s on verified PIN serviceability badge
                {"delay": 4.0, "action": "console.log('Scene 4: PIN 110001 verified for express courier dispatch');"},

                # SCENE 5: Add to Bag & Step Quantity in Cart Drawer (56s - 70s)
                {"delay": 1.5, "action": """
                    const addBtns = Array.from(document.querySelectorAll('button')).filter(b => 
                        b.textContent && b.textContent.includes('Add to Bag')
                    );
                    if (addBtns.length > 0) addBtns[addBtns.length - 1].click();
                """},
                # Hold 3.5s on Cart Drawer (1 item ₹49,500)
                {"delay": 3.5, "action": "console.log('Scene 5: Cart drawer active with Ivory Sherwani');"},
                # Tap + stepper to increment quantity to 2
                {"delay": 1.5, "action": """
                    const cartPlusBtns = Array.from(document.querySelectorAll('button')).filter(b => 
                        b.textContent && b.textContent.trim() === '+'
                    );
                    if (cartPlusBtns.length > 0) cartPlusBtns[cartPlusBtns.length - 1].click();
                """},
                # Hold 4.0s on updated subtotal ₹99,000
                {"delay": 4.0, "action": "console.log('Scene 5: Quantity stepped to 2, subtotal recalculated to ₹99,000');"},

                # SCENE 6: Bespoke Checkout & Verified Payment (70s - 86s)
                {"delay": 1.5, "action": """
                    const checkoutBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent && (b.textContent.includes('Checkout') || b.textContent.includes('Proceed to'))
                    );
                    if (checkoutBtn) checkoutBtn.click();
                """},
                # Hold 4.0s on Checkout Modal with Raghav's pre-filled Mehrauli address
                {"delay": 4.0, "action": "console.log('Scene 6: Reviewing pre-filled checkout delivery details');"},
                # Tap "Confirm & Pay via Test Gateway"
                {"delay": 1.5, "action": """
                    const payBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent && (b.textContent.includes('Pay') || b.textContent.includes('Confirm') || b.type === 'submit')
                    );
                    if (payBtn) payBtn.click();
                """},
                # Hold 6.0s on Bespoke Order Confirmation screen (WAAK-2026-XXXX, Paid, Insured Dispatch)
                {"delay": 6.0, "action": "console.log('Scene 6: Bespoke order confirmed & payment captured!');"},
                # Close order modal
                {"delay": 1.5, "action": """
                    const closeOrder = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent.includes('Return to Boutique') || b.textContent.includes('Close') || b.textContent === '✕'
                    );
                    if (closeOrder) closeOrder.click();
                """},

                # SCENE 7: Footer Newsletter & Governance Policies (86s - 100s)
                {"delay": 1.5, "action": """
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 3200, behavior: 'smooth' });
                """},
                {"delay": 2.5, "action": "console.log('Scene 7: Viewing luxury dark burgundy footer');"},
                # Enter email in newsletter
                {"delay": 1.5, "action": """
                    const footerInput = document.querySelector('footer input[type="email"]') || document.querySelector('input[placeholder*="email"]');
                    if (footerInput) {
                        footerInput.value = 'patron.exclusive@waak.in';
                        footerInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                """},
                {"delay": 1.5, "action": """
                    const subBtn = Array.from(document.querySelectorAll('footer button')).find(b => 
                        b.textContent && (b.textContent.includes('Subscribe') || b.textContent.includes('Join') || b.type === 'submit')
                    );
                    if (subBtn) subBtn.click();
                """},
                # Hold 3.5s on newsletter confirmation & DPDP 2023 notice
                {"delay": 3.5, "action": "console.log('Scene 7: Newsletter subscription confirmed with DPDP notice');"},
                # Open Shipping & Delivery policy
                {"delay": 1.5, "action": """
                    window.history.pushState({}, '', '/shipping-policy');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                """},
                # Hold 4.0s on policy governance disclaimer & draft notice
                {"delay": 4.0, "action": "console.log('Scene 7: Policy governance & terms audit verified');"},
                {"delay": 1.0, "action": "console.log('Deliberate walkthrough complete!');"}
            ]

            start_time = time.time()
            recording = True

            async def handle_incoming():
                nonlocal recording
                frame_count = 0
                while recording:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=0.8)
                        msg = json.loads(raw)
                        if msg.get("method") == "Page.screencastFrame":
                            session_id = msg["params"]["sessionId"]
                            b64data = msg["params"]["data"]
                            img_bytes = base64.b64decode(b64data)

                            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                            captured_frames.append(img)
                            frame_count += 1

                            await send_cmd(ws, 9999, "Page.screencastFrameAck", {"sessionId": session_id})
                    except asyncio.TimeoutError:
                        continue
                    except Exception:
                        break

            recv_task = asyncio.create_task(handle_incoming())

            for step in interactions:
                await asyncio.sleep(step["delay"])
                await send_cmd(ws, next_id(), "Runtime.evaluate", {"expression": step["action"]})

            await asyncio.sleep(2.0)
            recording = False
            await recv_task

            await send_cmd(ws, next_id(), "Page.stopScreencast")
            total_duration = time.time() - start_time
            log(f"Captured {len(captured_frames)} raw frames across {total_duration:.1f} seconds.")

            if not captured_frames:
                raise RuntimeError("No frames captured during recording.")

            # [4/4] Encode into true-to-life 1:1 speed MP4 video via Chrome MediaRecorder in SAME tab
            log(f"[4/4] Encoding {len(captured_frames)} frames into calm, true-to-life MP4 video at {total_duration:.1f}s duration...")

            TARGET_SIZE = (390, 844)
            uniform_frames = [f.resize(TARGET_SIZE, Image.Resampling.LANCZOS) for f in captured_frames]

            # Sample to 5 FPS (200ms per frame) to ensure relaxed, readable playback
            actual_fps = 5.0
            frame_interval_ms = 200
            target_frame_count = int(total_duration * actual_fps)
            step = max(1, len(uniform_frames) // target_frame_count)
            selected_frames = uniform_frames[::step]
            log(f"Selected {len(selected_frames)} frames. Pacing: exactly {frame_interval_ms}ms per frame ({actual_fps} FPS) matching {total_duration:.1f}s recording.")

            # Navigate tab to blank page to prepare for Canvas MediaRecorder
            await send_cmd(ws, next_id(), "Page.navigate", {"url": "about:blank"})
            await asyncio.sleep(1.0)

            setup_encoder = f"""
            window.recordedChunks = [];
            window.isDone = false;
            window.videoBase64 = null;

            document.body.style.margin = '0';
            document.body.style.background = '#0a0a0a';

            const canvas = document.createElement('canvas');
            canvas.width = 390;
            canvas.height = 844;
            canvas.id = 'canvas';
            document.body.appendChild(canvas);
            window.ctx = canvas.getContext('2d');

            const stream = canvas.captureStream({int(actual_fps)});

            let mimeType = 'video/mp4; codecs="avc1.42E01E"';
            if (!MediaRecorder.isTypeSupported(mimeType)) {{
                mimeType = 'video/mp4';
            }}
            window.usedMimeType = mimeType;

            window.recorder = new MediaRecorder(stream, {{
                mimeType: mimeType,
                videoBitsPerSecond: 2_500_000
            }});

            window.recorder.ondataavailable = (e) => {{
                if (e.data && e.data.size > 0) {{
                    window.recordedChunks.push(e.data);
                }}
            }};

            window.recorder.onstop = () => {{
                const blob = new Blob(window.recordedChunks, {{ type: window.usedMimeType }});
                const reader = new FileReader();
                reader.onloadend = () => {{
                    window.videoBase64 = reader.result;
                    window.isDone = true;
                }};
                reader.readAsDataURL(blob);
            }};

            window.recorder.start();
            """
            await send_cmd_and_wait(ws, next_id, "Runtime.evaluate", {"expression": setup_encoder})

            # Render selected frames in batches
            batch_size = 15
            for i in range(0, len(selected_frames), batch_size):
                batch = selected_frames[i:i + batch_size]
                b64_batch = []
                for f in batch:
                    buf = io.BytesIO()
                    f.save(buf, format="JPEG", quality=88)
                    b64_batch.append("data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode())

                draw_expr = f"""
                (async function() {{
                    const batch = {json.dumps(b64_batch)};
                    for (const src of batch) {{
                        await new Promise((resolve) => {{
                            const img = new Image();
                            img.onload = () => {{
                                window.ctx.drawImage(img, 0, 0, 390, 844);
                                setTimeout(resolve, {frame_interval_ms});
                            }};
                            img.src = src;
                        }});
                    }}
                }})()
                """
                await send_cmd_and_wait(ws, next_id, "Runtime.evaluate", {"expression": draw_expr, "awaitPromise": True})
                log(f"  Encoded {min(i + batch_size, len(selected_frames))} / {len(selected_frames)} frames...")

            # Stop recorder and retrieve base64 data
            await send_cmd_and_wait(ws, next_id, "Runtime.evaluate", {"expression": "setTimeout(() => window.recorder.stop(), 500);"})

            log("Finalizing MP4 video export...")
            for _ in range(50):
                res = await send_cmd_and_wait(ws, next_id, "Runtime.evaluate", {
                    "expression": "JSON.stringify({ isDone: Boolean(window.isDone), hasData: Boolean(window.videoBase64) })",
                    "returnByValue": True
                })
                val = json.loads(res.get("result", {}).get("result", {}).get("value", "{}"))
                if val.get("isDone") and val.get("hasData"):
                    break
                await asyncio.sleep(0.5)

            data_res = await send_cmd_and_wait(ws, next_id, "Runtime.evaluate", {
                "expression": "window.videoBase64",
                "returnByValue": True
            })
            data_url = data_res.get("result", {}).get("result", {}).get("value", "")

            header, b64_content = data_url.split(",", 1)
            video_bytes = base64.b64decode(b64_content)

            mp4_artifact = os.path.join(ARTIFACT_DIR, "waak_mobile_walkthrough.mp4")
            mp4_public = os.path.join(PUBLIC_DIR, "waak-mobile-walkthrough.mp4")

            with open(mp4_artifact, "wb") as f:
                f.write(video_bytes)
            shutil.copy2(mp4_artifact, mp4_public)

            log(f"[OK] Saved Deliberate 1:1 Paced MP4 Video: {mp4_artifact} ({len(video_bytes) // 1024} KB, ~{total_duration:.1f}s)")
            log(f"[OK] Copied to public assets: {mp4_public}")

            # Also update WebP and GIF animations with matching calm pacing
            log("Updating WebP and GIF animations with relaxed frame intervals...")
            anim_step = max(1, len(selected_frames) // 100)
            anim_frames = selected_frames[::anim_step]
            anim_frame_duration = int(total_duration * 1000 / len(anim_frames))

            webp_artifact = os.path.join(ARTIFACT_DIR, "waak_mobile_walkthrough.webp")
            webp_public = os.path.join(PUBLIC_DIR, "waak-mobile-walkthrough.webp")
            anim_frames[0].save(
                webp_artifact,
                save_all=True,
                append_images=anim_frames[1:],
                duration=anim_frame_duration,
                loop=0,
                quality=85
            )
            shutil.copy2(webp_artifact, webp_public)

            gif_artifact = os.path.join(ARTIFACT_DIR, "waak_mobile_walkthrough.gif")
            gif_public = os.path.join(PUBLIC_DIR, "waak-mobile-walkthrough.gif")
            gif_frames = [f.resize((320, 692), Image.Resampling.LANCZOS) for f in anim_frames]
            gif_frames[0].save(
                gif_artifact,
                save_all=True,
                append_images=gif_frames[1:],
                duration=anim_frame_duration,
                loop=0,
                optimize=True
            )
            shutil.copy2(gif_artifact, gif_public)
            log("[OK] All media formats updated with relaxed, deliberate pacing.")

    finally:
        proc.terminate()
        log("Headless Chrome process terminated cleanly.")

if __name__ == "__main__":
    asyncio.run(record_and_encode())
