import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Capture console logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err.message}"))
        
        await page.goto("http://localhost:8001/")
        await page.wait_for_selector("#loginUser")
        
        await page.fill("#loginUser", "wagahsan")
        await page.fill("#loginPass", "trc2026")
        await page.click("#loginBtn")
        
        await page.wait_for_timeout(2000)
        
        is_hidden = await page.evaluate("document.getElementById('loginOverlay').classList.contains('hidden')")
        print(f"Login Overlay Hidden: {is_hidden}")
        
        error_text = await page.inner_text("#loginError")
        if error_text:
            print(f"Login Error Text: {error_text}")
        
        await browser.close()

asyncio.run(main())
