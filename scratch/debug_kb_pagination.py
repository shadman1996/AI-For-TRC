from playwright.sync_api import sync_playwright

def inspect_pagination():
    url = "https://services.smsu.edu/TDClient/180/Portal/KB/Search"
    print("Launching Chromium...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        
        # Click search
        print("Clicking search...")
        page.locator("#ctl00_ctl00_cpContent_cpContent_btnSearch").click()
        page.wait_for_timeout(4000)
        
        # Look for the pagination elements
        print("\n=== PAGE 1 STATE ===")
        print("Current URL:", page.url)
        
        # Find all active page links or next buttons
        pagination_container = page.locator(".pagination, .pager, ul.pagination")
        if pagination_container.count() > 0:
            print("Found pagination container!")
            print("Outer HTML:", pagination_container.first.evaluate("el => el.outerHTML"))
        else:
            print("Pagination container not found by class. Finding all links in table or pages...")
            # Let's inspect links that look like numbers or next
            links = page.locator("a").all()
            for l in links:
                text = l.inner_text().strip()
                id_val = l.get_attribute("id") or ""
                href = l.get_attribute("href") or ""
                if text in ["2", "3", "Next", ">", "»"] or "lnkNext" in id_val or "lnkNext" in href:
                    print(f"Pagination Candidate: Text='{text}' | ID='{id_val}' | Href='{href}' | HTML='{l.evaluate('el => el.outerHTML')}'")
        
        # Try to click "Next"
        next_btn = page.locator("a:has-text('Next'), a[id*='lnkNext']")
        if next_btn.count() > 0:
            active_next = None
            for idx in range(next_btn.count()):
                btn = next_btn.nth(idx)
                if btn.is_visible():
                    active_next = btn
                    break
                    
            if active_next:
                print("\nClicking 'Next' button...")
                # We can wait for navigation or load state if postback reloads
                # ASP.NET postback reloads the frame/page.
                try:
                    with page.expect_navigation(timeout=8000):
                        active_next.click()
                except Exception as e:
                    print("Expect navigation timeout/error, doing manual wait...", e)
                    page.wait_for_timeout(4000)
                
                print("\n=== PAGE 2 STATE ===")
                print("Current URL:", page.url)
                
                # Check links again on Page 2
                links2 = page.locator("a").all()
                page2_articles = []
                for link in links2:
                    href = link.get_attribute("href")
                    text = link.inner_text().strip()
                    if href and ("/KB/ArticleDet" in href or "/KB/Article/" in href):
                        page2_articles.append((text, href))
                        
                print(f"Found {len(page2_articles)} article links on Page 2:")
                for text, href in page2_articles[:5]:
                    print(f" - {text} -> {href}")
            else:
                print("No visible 'Next' button found.")
        else:
            print("No 'Next' button found by locator.")
            
        browser.close()

if __name__ == "__main__":
    inspect_pagination()
