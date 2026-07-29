import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir="videos/",
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000")

        # Wait for the initial "Verify Sovereign Identity" button
        print("Waiting for identity verification button...")
        verify_btn = page.locator("button:has-text('Verify Sovereign Identity')")
        await verify_btn.wait_for(state="visible", timeout=10000)
        await verify_btn.click()

        # Wait for the next stage and click "Enter Voting Dashboard"
        print("Waiting for 'Enter Voting Dashboard' button (simulated delay)...")
        enter_btn = page.locator("button:has-text('Enter Voting Dashboard')")
        await enter_btn.wait_for(state="visible", timeout=20000)
        await enter_btn.click()

        # Wait for the dashboard to load and click the Proposal Compiler tab
        print("Waiting for Proposal Compiler tab...")
        compiler_tab = page.locator("button:has-text('Proposal Compiler')")
        await compiler_tab.wait_for(state="visible", timeout=10000)
        await compiler_tab.click()

        print("Entering Title...")
        title_input = page.locator("input[placeholder='Enter proposal title...']")
        await title_input.wait_for(state="visible")
        await title_input.fill("Testing XSS Fix")

        print("Entering payload...")
        textarea = page.locator("textarea")
        await textarea.wait_for(state="visible")

        payload = "This proposal is to censor <img src=x onerror=alert('XSS_SUCCESS')>"
        await textarea.fill(payload)

        # We must use Playwright's specific evaluate block correctly to modify the DOM element
        print("Enabling compile button...")
        # Since we know `hasValidationError` disables it, we can just remove the `disabled` property.
        await page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const compileBtn = btns.find(b => b.textContent && b.textContent.includes('Compile & Submit'));
            if(compileBtn) {
                compileBtn.disabled = false;
                compileBtn.removeAttribute('disabled');
            }
        }""")

        # Click Compile
        print("Compiling proposal...")
        compile_btn = page.locator("button:has-text('Compile & Submit')")
        await compile_btn.click(force=True)

        # Wait for the violation output
        print("Waiting for output...")
        await page.wait_for_timeout(2000)

        # Scroll down more to see the compiler output
        await page.keyboard.press("PageDown")
        await page.wait_for_timeout(1000)

        # Take screenshot of the result
        screenshot_path = "xss_fixed_screenshot.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        # Close the context to ensure the video is saved
        await context.close()
        await browser.close()

        print("Verification complete.")

asyncio.run(main())
