import subprocess
import time
import json
import urllib.request
import asyncio
import websockets
import base64
import os
import io
import shutil
from PIL import Image

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"C:\Users\Takemichi\.gemini\antigravity\brain\755e5651-9ae8-440d-b3d7-aa3553699cc2\scratch\full_mobile_frames"
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
    # 1. Launch Chrome in mobile portrait viewport (iPhone 14/15 size 390x844)
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9224",
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
        # 2. Connect to CDP
        tabs = []
        for _ in range(10):
            try:
                with urllib.request.urlopen("http://localhost:9224/json") as resp:
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
        print(f"Connected to CDP at {ws_url}")

        async with websockets.connect(ws_url, max_size=50_000_000) as ws:
            msg_id = 1

            await send_cmd(ws, msg_id, "Page.enable"); msg_id += 1
            await send_cmd(ws, msg_id, "Runtime.enable"); msg_id += 1

            # Mobile device emulation
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

            # Start mobile screencast
            await send_cmd(ws, msg_id, "Page.startScreencast", {
                "format": "jpeg",
                "quality": 85,
                "maxWidth": 390,
                "maxHeight": 844,
                "everyNthFrame": 1
            }); msg_id += 1

            print("Recording full mobile journey: Hero -> Account Login -> Sizing -> PIN -> Bag -> Checkout & Payment -> Policy & Newsletter...")

            # End-to-end mobile interaction script
            interactions = [
                # -------------------------------------------------------------
                # SCENE 1: Theatrical Curtain Reveal & Mobile Storefront
                # -------------------------------------------------------------
                {"delay": 3.2, "action": "console.log('Scene 1: Curtain parted');"},

                # -------------------------------------------------------------
                # SCENE 2: Patron Login (/account)
                # -------------------------------------------------------------
                {"delay": 1.2, "action": """
                    // Navigate to account
                    const navAccountBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
                        el.getAttribute('aria-label') === 'Client account' || 
                        el.textContent.includes('Account') || 
                        el.innerHTML.includes('Account') ||
                        el.querySelector('svg')
                    );
                    if (window.dispatchEvent) {
                        window.history.pushState({}, '', '/account');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                """},

                # Fill in Patron Login
                {"delay": 2.0, "action": """
                    const emailInput = document.querySelector('input[type="email"]') || document.querySelectorAll('input')[0];
                    const passInput = document.querySelector('input[type="password"]') || document.querySelectorAll('input')[1];
                    if (emailInput && passInput) {
                        emailInput.value = 'raghav.mehra@waak.in';
                        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                        passInput.value = 'securePassword2026!';
                        passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                """},

                # Submit Login
                {"delay": 1.5, "action": """
                    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent.includes('Sign In') || b.textContent.includes('Login') || b.type === 'submit'
                    );
                    if (submitBtn) submitBtn.click();
                """},

                # Pause on Logged-in Patron Dashboard (viewing Raghav Mehra, Mehrauli address)
                {"delay": 2.5, "action": "console.log('Scene 2: Logged in dashboard active');"},

                # -------------------------------------------------------------
                # SCENE 3: Return to Storefront & Discover Collection
                # -------------------------------------------------------------
                {"delay": 1.5, "action": """
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                """},

                # Scroll down past category circles to New Arrivals
                {"delay": 1.8, "action": "window.scrollTo({ top: 720, behavior: 'smooth' });"},

                # Tap on signature piece (Ivory Zardozi Sherwani)
                {"delay": 2.0, "action": """
                    const card = document.querySelector('.new-arrival-card') || document.querySelector('[data-product-id="waak-01"]') || document.querySelector('.product-card');
                    if (card) card.click();
                """},

                # -------------------------------------------------------------
                # SCENE 4: Product Detail Page, Sizing Modal & PIN Checker
                # -------------------------------------------------------------
                {"delay": 2.2, "action": """
                    window.scrollTo({ top: 360, behavior: 'smooth' });
                """},

                # Open Size Guide Modal
                {"delay": 1.8, "action": """
                    const guideBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent && b.textContent.toLowerCase().includes('size guide')
                    );
                    if (guideBtn) guideBtn.click();
                """},

                # Inspect Size Guide measurement chart
                {"delay": 2.2, "action": "console.log('Inspecting size measurements');"},

                # Close Size Guide Modal
                {"delay": 1.2, "action": """
                    const closeGuide = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent === '✕' || b.textContent === '×' || b.getAttribute('aria-label') === 'Close size guide'
                    );
                    if (closeGuide) closeGuide.click();
                """},

                # Select authentic chest size 40
                {"delay": 1.5, "action": """
                    const sizeBtns = Array.from(document.querySelectorAll('button'));
                    const size40 = sizeBtns.find(b => b.textContent && b.textContent.trim() === '40');
                    if (size40) size40.click();
                """},

                # Enter delivery PIN code 110001 & check
                {"delay": 2.0, "action": """
                    const pinInput = document.querySelector('input[placeholder*="PIN"]') || document.querySelector('input[type="text"]');
                    if (pinInput) {
                        pinInput.value = '110001';
                        pinInput.dispatchEvent(new Event('input', { bubbles: true }));
                        pinInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    const checkBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent && b.textContent.trim().toLowerCase().includes('check')
                    );
                    if (checkBtn) checkBtn.click();
                """},

                # -------------------------------------------------------------
                # SCENE 5: Add to Bag & Step Quantity in Cart Drawer
                # -------------------------------------------------------------
                {"delay": 2.2, "action": """
                    const addBtns = Array.from(document.querySelectorAll('button')).filter(b => 
                        b.textContent && b.textContent.includes('Add to Bag')
                    );
                    if (addBtns.length > 0) addBtns[addBtns.length - 1].click();
                """},

                # In Cart Drawer: Step quantity to 2
                {"delay": 2.5, "action": """
                    const cartPlusBtns = Array.from(document.querySelectorAll('button')).filter(b => 
                        b.textContent && b.textContent.trim() === '+'
                    );
                    if (cartPlusBtns.length > 0) {
                        cartPlusBtns[cartPlusBtns.length - 1].click();
                    }
                """},

                # -------------------------------------------------------------
                # SCENE 6: Proceed to Bespoke Checkout & Test Payment
                # -------------------------------------------------------------
                {"delay": 2.5, "action": """
                    const checkoutBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent && (b.textContent.includes('Checkout') || b.textContent.includes('Proceed to'))
                    );
                    if (checkoutBtn) checkoutBtn.click();
                """},

                # Ensure Checkout Form is filled (pre-filled or populate)
                {"delay": 2.0, "action": """
                    const inputs = document.querySelectorAll('input');
                    inputs.forEach(input => {
                        const name = (input.name || input.placeholder || '').toLowerCase();
                        if (name.includes('email') && !input.value) input.value = 'raghav.mehra@waak.in';
                        if (name.includes('first') && !input.value) input.value = 'Raghav';
                        if (name.includes('last') && !input.value) input.value = 'Mehra';
                        if (name.includes('phone') && !input.value) input.value = '+91 99887 76655';
                        if (name.includes('address') && !input.value) input.value = 'Atelier Villa, Mehrauli Couture District';
                        if (name.includes('city') && !input.value) input.value = 'New Delhi';
                        if (name.includes('state') && !input.value) input.value = 'Delhi';
                        if (name.includes('pin') || name.includes('postal')) {
                            input.value = '110001';
                        }
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                """},

                # Click "Confirm & Pay via Test Gateway"
                {"delay": 2.5, "action": """
                    const payBtn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent && (b.textContent.includes('Pay') || b.textContent.includes('Confirm') || b.type === 'submit')
                    );
                    if (payBtn) payBtn.click();
                """},

                # Pause on Verified Order Confirmation screen (WAAK-2026-XXXX, Paid, Insured Transit)
                {"delay": 3.8, "action": "console.log('Order Confirmed & Paid');"},

                # Close Checkout Modal
                {"delay": 1.5, "action": """
                    const closeOrder = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent.includes('Return to Boutique') || b.textContent.includes('Close') || b.textContent === '✕'
                    );
                    if (closeOrder) closeOrder.click();
                """},

                # -------------------------------------------------------------
                # SCENE 7: Footer Newsletter & Policy Navigation
                # -------------------------------------------------------------
                {"delay": 1.8, "action": """
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 3000, behavior: 'smooth' });
                """},

                # Subscribe to newsletter in footer
                {"delay": 2.2, "action": """
                    const footerInput = document.querySelector('footer input[type="email"]') || document.querySelector('input[placeholder*="email"]');
                    if (footerInput) {
                        footerInput.value = 'patron.bridal@waak.co.in';
                        footerInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    const subBtn = document.querySelector('footer button[type="submit"]') || Array.from(document.querySelectorAll('footer button')).find(b => b.textContent.includes('Join'));
                    if (subBtn) subBtn.click();
                """},

                # Tap Terms of Service link in footer
                {"delay": 2.2, "action": """
                    window.history.pushState({}, '', '/terms-of-service');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                """},

                # Display Policy view with Legal Draft Notice Banner
                {"delay": 2.5, "action": "console.log('Displaying Legal Draft Notice banner');"},

                # Smoothly return to top of home storefront
                {"delay": 1.5, "action": """
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                """},

                {"delay": 1.5, "action": "console.log('Full mobile walkthrough complete');"}
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

    # Compile Mobile Animations
    if frames:
        print("Compiling full mobile experience into high-fidelity WebP and GIF animations...")

        # Subsample to ~120 frames total
        step = max(1, len(frames) // 120)
        selected_frames = frames[::step]
        print(f"Selected {len(selected_frames)} frames (step={step}).")

        TARGET_SIZE = (390, 844)
        uniform_frames = [f.resize(TARGET_SIZE, Image.Resampling.LANCZOS) for f in selected_frames]
        print(f"Normalized all {len(uniform_frames)} frames to exact target dimensions {TARGET_SIZE}.")

        # WebP Animation
        webp_path_artifact = os.path.join(ARTIFACT_DIR, "waak_mobile_walkthrough.webp")
        webp_path_public = os.path.join(PUBLIC_DIR, "waak-mobile-walkthrough.webp")

        uniform_frames[0].save(
            webp_path_artifact,
            save_all=True,
            append_images=uniform_frames[1:],
            duration=140,
            loop=0,
            quality=85
        )
        shutil.copy2(webp_path_artifact, webp_path_public)
        print(f"[OK] Saved Mobile WebP Video: {webp_path_artifact} ({os.path.getsize(webp_path_artifact) // 1024} KB)")

        # GIF Animation (compact 320x692 for universal compatibility)
        gif_path_artifact = os.path.join(ARTIFACT_DIR, "waak_mobile_walkthrough.gif")
        gif_path_public = os.path.join(PUBLIC_DIR, "waak-mobile-walkthrough.gif")

        gif_frames = [f.resize((320, 692), Image.Resampling.LANCZOS) for f in uniform_frames]
        gif_frames[0].save(
            gif_path_artifact,
            save_all=True,
            append_images=gif_frames[1:],
            duration=140,
            loop=0,
            optimize=True
        )
        shutil.copy2(gif_path_artifact, gif_path_public)
        print(f"[OK] Saved Mobile GIF Video: {gif_path_artifact} ({os.path.getsize(gif_path_artifact) // 1024} KB)")

if __name__ == "__main__":
    asyncio.run(record())
