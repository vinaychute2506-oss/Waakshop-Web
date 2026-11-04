import subprocess
import time
import json
import urllib.request
import asyncio
import websockets
import os
import base64

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
CDP_PORT = 9444
USER_DATA_DIR = r"c:\Users\Takemichi\Desktop\Waak Shop Web\scratch\chrome_qa_profile"
OUTPUT_DIR = r"c:\Users\Takemichi\Desktop\Waak Shop Web\scratch\qa_screenshots_step3"

os.makedirs(OUTPUT_DIR, exist_ok=True)

VIEWPORTS = [
    {"name": "mobile_320", "width": 320, "height": 640},
    {"name": "mobile_375", "width": 375, "height": 667},
    {"name": "mobile_390", "width": 390, "height": 844},
    {"name": "mobile_430", "width": 430, "height": 932},
    {"name": "tablet_768", "width": 768, "height": 1024},
    {"name": "desktop_1024", "width": 1024, "height": 768},
    {"name": "desktop_1440", "width": 1440, "height": 900},
]

async def send_cmd(ws, msg_id, method, params=None, timeout=10):
    payload = {"id": msg_id, "method": method, "params": params or {}}
    await ws.send(json.dumps(payload))
    
    start_t = time.time()
    while time.time() - start_t < timeout:
        try:
            resp = await asyncio.wait_for(ws.recv(), timeout=1.5)
            data = json.loads(resp)
            if data.get("id") == msg_id:
                return data
        except asyncio.TimeoutError:
            pass
    raise TimeoutError(f"Command {method} (id={msg_id}) timed out after {timeout}s")

async def evaluate_script(ws, msg_id, expr):
    res = await send_cmd(ws, msg_id, "Runtime.evaluate", {
        "expression": expr,
        "returnByValue": True,
        "awaitPromise": True
    })
    return res.get("result", {}).get("result", {}).get("value")

async def run_qa():
    chrome_proc = subprocess.Popen([
        CHROME_PATH,
        f"--remote-debugging-port={CDP_PORT}",
        f"--user-data-dir={USER_DATA_DIR}",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--remote-allow-origins=*",
        "--window-size=1440,900"
    ])
    
    time.sleep(2)
    
    try:
        await asyncio.sleep(2)
        req = urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json")
        tabs = json.loads(req.read().decode("utf-8"))
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        
        all_metrics = []
        
        async with websockets.connect(ws_url, max_size=50*1024*1024) as ws:
            msg_id = 1
            await send_cmd(ws, msg_id, "Page.enable"); msg_id += 1
            await send_cmd(ws, msg_id, "DOM.enable"); msg_id += 1
            
            for vp in VIEWPORTS:
                print(f"\n=======================================================")
                print(f"Testing Viewport: {vp['name']} ({vp['width']}x{vp['height']})")
                print(f"=======================================================")
                
                # Set device metrics
                await send_cmd(ws, msg_id, "Emulation.setDeviceMetricsOverride", {
                    "width": vp["width"],
                    "height": vp["height"],
                    "deviceScaleFactor": 2,
                    "mobile": vp["width"] <= 768
                }); msg_id += 1
                
                # Navigate to Home
                await send_cmd(ws, msg_id, "Page.navigate", {"url": "http://localhost:5173/"}); msg_id += 1
                await asyncio.sleep(1.5)
                
                # Click first product to transition to PDP
                await evaluate_script(ws, msg_id, """
                    (() => {
                        const card = document.querySelector('.new-arrival-card') || document.querySelector('.product-card');
                        if (card) card.click();
                    })()
                """); msg_id += 1
                await asyncio.sleep(1.2)
                
                # Measure PDP
                pdp_metrics = await evaluate_script(ws, msg_id, """
                    (() => {
                        const docWidth = document.documentElement.scrollWidth;
                        const winWidth = window.innerWidth;
                        const hasOverflow = docWidth > winWidth;
                        
                        const trustCard = document.querySelector('.pdp-trust-assurance-card');
                        let trustCardRect = null;
                        let trustItemsCount = 0;
                        if (trustCard) {
                            const r = trustCard.getBoundingClientRect();
                            trustCardRect = {
                                width: Math.round(r.width),
                                height: Math.round(r.height),
                                top: Math.round(r.top)
                            };
                            trustItemsCount = trustCard.querySelectorAll('.pdp-trust-item').length;
                        }
                        
                        const policyLinks = Array.from(document.querySelectorAll('.pdp-trust-policy-link')).map(b => {
                            const r = b.getBoundingClientRect();
                            return {
                                text: b.textContent.trim(),
                                width: Math.round(r.width),
                                height: Math.round(r.height)
                            };
                        });
                        
                        const addBtn = document.querySelector('.pdp-add-to-bag-btn');
                        let addBtnHeight = 0;
                        if (addBtn) {
                            addBtnHeight = Math.round(addBtn.getBoundingClientRect().height);
                        }
                        
                        const isWhatsAppRendered = !!document.querySelector('.waak-whatsapp-inquiry-btn');
                        
                        return {
                            winWidth,
                            docWidth,
                            hasOverflow,
                            trustCardPresent: !!trustCard,
                            trustCardRect,
                            trustItemsCount,
                            policyLinks,
                            addBtnHeight,
                            isWhatsAppRendered
                        };
                    })()
                """); msg_id += 1
                
                # Capture PDP screenshot
                ss_pdp = await send_cmd(ws, msg_id, "Page.captureScreenshot", {"format": "png"}); msg_id += 1
                pdp_path = os.path.join(OUTPUT_DIR, f"pdp_trust_{vp['name']}.png")
                with open(pdp_path, "wb") as f:
                    f.write(base64.b64decode(ss_pdp["result"]["data"]))
                print(f"  [PDP] Overflow: {pdp_metrics['hasOverflow']} (doc={pdp_metrics['docWidth']}px, win={pdp_metrics['winWidth']}px) | TrustCard: {pdp_metrics['trustCardPresent']} ({pdp_metrics['trustItemsCount']} items) | AddBtnHeight: {pdp_metrics['addBtnHeight']}px | WhatsAppGated: {not pdp_metrics['isWhatsAppRendered']}")
                
                # Add to cart
                await evaluate_script(ws, msg_id, """
                    (() => {
                        const addBtn = document.querySelector('.pdp-add-to-bag-btn');
                        if (addBtn) addBtn.click();
                    })()
                """); msg_id += 1
                await asyncio.sleep(0.8)
                
                # Open Cart Drawer
                await evaluate_script(ws, msg_id, """
                    (() => {
                        const cartBtn = document.querySelector('.navbar-cart-btn') || Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('Cart'));
                        if (cartBtn) cartBtn.click();
                    })()
                """); msg_id += 1
                await asyncio.sleep(0.8)
                
                # Click Proceed to Bespoke Checkout
                await evaluate_script(ws, msg_id, """
                    (() => {
                        const checkoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Bespoke Checkout') || b.textContent.includes('Checkout'));
                        if (checkoutBtn) checkoutBtn.click();
                    })()
                """); msg_id += 1
                await asyncio.sleep(1.0)
                
                # Measure Checkout Modal
                checkout_metrics = await evaluate_script(ws, msg_id, """
                    (() => {
                        const docWidth = document.documentElement.scrollWidth;
                        const winWidth = window.innerWidth;
                        const hasOverflow = docWidth > winWidth;
                        
                        const modalOverlay = document.querySelector('.checkout-modal-overlay');
                        const modalContent = document.querySelector('.checkout-modal-card');
                        const securityCard = document.querySelector('.checkout-security-card');
                        const submitBtn = document.querySelector('.checkout-submit-btn');
                        
                        let modalCardRect = null;
                        if (modalContent) {
                            const r = modalContent.getBoundingClientRect();
                            modalCardRect = {
                                width: Math.round(r.width),
                                height: Math.round(r.height)
                            };
                        }
                        
                        let securityCardRect = null;
                        let securityItemsCount = 0;
                        if (securityCard) {
                            const r = securityCard.getBoundingClientRect();
                            securityCardRect = {
                                width: Math.round(r.width),
                                height: Math.round(r.height)
                            };
                            securityItemsCount = securityCard.querySelectorAll('.checkout-security-list li').length;
                        }
                        
                        let submitBtnMetrics = null;
                        if (submitBtn) {
                            const r = submitBtn.getBoundingClientRect();
                            submitBtnMetrics = {
                                width: Math.round(r.width),
                                height: Math.round(r.height),
                                text: submitBtn.textContent.replace(/\\s+/g, ' ').trim()
                            };
                        }
                        
                        return {
                            hasOverflow,
                            modalPresent: !!modalOverlay,
                            modalCardRect,
                            securityCardPresent: !!securityCard,
                            securityCardRect,
                            securityItemsCount,
                            submitBtnMetrics
                        };
                    })()
                """); msg_id += 1
                
                # Capture Checkout screenshot
                ss_checkout = await send_cmd(ws, msg_id, "Page.captureScreenshot", {"format": "png"}); msg_id += 1
                checkout_path = os.path.join(OUTPUT_DIR, f"checkout_trust_{vp['name']}.png")
                with open(checkout_path, "wb") as f:
                    f.write(base64.b64decode(ss_checkout["result"]["data"]))
                safe_btn_text = checkout_metrics['submitBtnMetrics']['text'].replace('\u20b9', 'Rs.') if checkout_metrics.get('submitBtnMetrics') else 'N/A'
                btn_height = checkout_metrics['submitBtnMetrics']['height'] if checkout_metrics.get('submitBtnMetrics') else 0
                print(f"  [Checkout] Modal: {checkout_metrics['modalPresent']} | SecurityCard: {checkout_metrics['securityCardPresent']} ({checkout_metrics['securityItemsCount']} items) | SubmitBtn: {btn_height}px ('{safe_btn_text}')")
                
                all_metrics.append({
                    "viewport": vp,
                    "pdp": pdp_metrics,
                    "checkout": checkout_metrics
                })
        
        with open(os.path.join(OUTPUT_DIR, "step3_qa_results.json"), "w", encoding="utf-8") as f:
            json.dump(all_metrics, f, indent=2)
        print("\nAll 7 viewports inspected and recorded!")
        
    finally:
        chrome_proc.terminate()
        try:
            chrome_proc.wait(timeout=3)
        except Exception:
            chrome_proc.kill()

if __name__ == "__main__":
    asyncio.run(run_qa())
