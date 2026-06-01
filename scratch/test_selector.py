from playwright.sync_api import sync_playwright

def test():
    url = "https://services.smsu.edu/TDClient/180/Portal/KB/Article/4837/Make-Me-Admin-Instructions"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, timeout=30000)
        page.wait_for_selector("#ctl00_ctl00_cpContent_cpContent_divBody")
        
        body = page.locator("#ctl00_ctl00_cpContent_cpContent_divBody").inner_text().strip()
        print("SELECTOR WORKS!")
        print(body[:200])
        browser.close()

if __name__ == "__main__":
    test()
