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
from PIL import Image, ImageSequence

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SRC_WEBP = r"C:\Users\Takemichi\.gemini\antigravity\brain\755e5651-9ae8-440d-b3d7-aa3553699cc2\waak_mobile_walkthrough.webp"
DST_MP4_ARTIFACT = r"C:\Users\Takemichi\.gemini\antigravity\brain\755e5651-9ae8-440d-b3d7-aa3553699cc2\waak_mobile_walkthrough.mp4"
DST_MP4_PUBLIC = r"c:\Users\Takemichi\Desktop\Waak Shop Web\public\assets\waak-mobile-walkthrough.mp4"

async def convert():
    print(f"Reading source WebP frames from {SRC_WEBP}...")
    im = Image.open(SRC_WEBP)
    frames = [f.copy().convert("RGB") for f in ImageSequence.Iterator(im)]
    print(f"Loaded {len(frames)} frames. Preparing data URLs...")

    # Launch Chrome on debugging port 9227
    p = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9227",
        "--window-size=600,1000",
        "--disable-gpu"
    ])
    await asyncio.sleep(2.0)

    try:
        with urllib.request.urlopen("http://localhost:9227/json") as r:
            tabs = json.loads(r.read().decode())
        ws_url = tabs[0]["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url, max_size=150_000_000) as ws:
            msg_id = 1
            async def send(method, params=None):
                nonlocal msg_id
                current_id = msg_id
                payload = {"id": current_id, "method": method}
                if params:
                    payload["params"] = params
                msg_id += 1
                await ws.send(json.dumps(payload))
                while True:
                    raw = await ws.recv()
                    parsed = json.loads(raw)
                    if parsed.get("id") == current_id:
                        return parsed

            await send("Page.enable")
            await send("Runtime.enable")

            # Setup HTML page with Canvas and MediaRecorder
            setup_script = """
            window.recordedChunks = [];
            window.isDone = false;
            window.videoBase64 = null;

            const canvas = document.createElement('canvas');
            canvas.width = 390;
            canvas.height = 844;
            canvas.id = 'canvas';
            document.body.appendChild(canvas);
            window.ctx = canvas.getContext('2d');

            // 10 FPS stream for 100ms per frame
            const stream = canvas.captureStream(10);
            
            // Prefer video/mp4, fallback to video/webm
            let mimeType = 'video/mp4';
            if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E"')) {
                mimeType = 'video/mp4; codecs="avc1.42E01E"';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            } else {
                mimeType = 'video/webm; codecs=vp9';
            }
            window.usedMimeType = mimeType;
            console.log('Using MIME type:', mimeType);

            window.recorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 3_000_000
            });

            window.recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    window.recordedChunks.push(e.data);
                }
            };

            window.recorder.onstop = () => {
                const blob = new Blob(window.recordedChunks, { type: window.usedMimeType });
                const reader = new FileReader();
                reader.onloadend = () => {
                    window.videoBase64 = reader.result;
                    window.isDone = true;
                };
                reader.readAsDataURL(blob);
            };

            window.recorder.start();
            """

            await send("Runtime.evaluate", {"expression": setup_script})

            # Feed frames in chunks
            print(f"Feeding {len(frames)} frames into Chrome canvas video encoder...")
            batch_size = 10
            for i in range(0, len(frames), batch_size):
                batch = frames[i:i + batch_size]
                b64_batch = []
                for f in batch:
                    buf = io.BytesIO()
                    f.save(buf, format="JPEG", quality=90)
                    b64_batch.append("data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode())

                draw_expr = f"""
                (async function() {{
                    const batch = {json.dumps(b64_batch)};
                    for (const src of batch) {{
                        await new Promise((resolve) => {{
                            const img = new Image();
                            img.onload = () => {{
                                window.ctx.drawImage(img, 0, 0, 390, 844);
                                setTimeout(resolve, 100);
                            }};
                            img.src = src;
                        }});
                    }}
                }})()
                """
                await send("Runtime.evaluate", {"expression": draw_expr, "awaitPromise": True})
                print(f"Rendered frames {i + 1} to {min(i + batch_size, len(frames))}...")

            # Finish recording
            finish_expr = """
            setTimeout(() => {
                window.recorder.stop();
            }, 500);
            """
            await send("Runtime.evaluate", {"expression": finish_expr})

            # Wait for base64 completion
            print("Encoding video stream to MP4...")
            for _ in range(30):
                res = await send("Runtime.evaluate", {
                    "expression": "JSON.stringify({ isDone: Boolean(window.isDone), mime: window.usedMimeType, hasData: Boolean(window.videoBase64) })",
                    "returnByValue": True
                })
                val = json.loads(res.get("result", {}).get("result", {}).get("value", "{}"))
                if val.get("isDone") and val.get("hasData"):
                    break
                await asyncio.sleep(0.5)

            # Retrieve video data
            data_res = await send("Runtime.evaluate", {
                "expression": "window.videoBase64",
                "returnByValue": True
            })
            data_url = data_res.get("result", {}).get("result", {}).get("value", "")

            # Parse base64 header
            header, b64_content = data_url.split(",", 1)
            video_bytes = base64.b64decode(b64_content)

            with open(DST_MP4_ARTIFACT, "wb") as f:
                f.write(video_bytes)
            shutil.copy2(DST_MP4_ARTIFACT, DST_MP4_PUBLIC)

            print(f"[OK] Saved MP4 Video: {DST_MP4_ARTIFACT} ({len(video_bytes) // 1024} KB)")
            print(f"[OK] Copied MP4 Video to public: {DST_MP4_PUBLIC}")

    finally:
        p.terminate()

if __name__ == "__main__":
    asyncio.run(convert())
