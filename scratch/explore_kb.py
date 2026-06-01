from playwright.sync_api import sync_playwright
import urllib.parse

def explore():
    url = "https://services.smsu.edu/TDClient/180/Portal/KB/Category/789/Information-Technology-Services"
    print("Launching browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print(f"Navigating to {url}...")
        page.goto(url, timeout=30000)
        page.wait_for_selector(".category-box, a")
        
        # Get category boxes or links
        print("Extracting category links...")
        links = page.locator("a").all()
        categories = []
        articles = []
        for link in links:
            href = link.get_attribute("href")
            text = link.inner_text().strip()
            if not href:
                continue
            
            # TeamDynamix KB category link: /TDClient/180/Portal/KB/Category/ or /TDClient/180/Portal/KB/Article/
            full_url = urllib.parse.urljoin(url, href)
            if "/KB/Category/" in full_url:
                if full_url not in [c[1] for c in categories] and href != "#":
                    categories.append((text, full_url))
            elif "/KB/ArticleDet" in full_url or "/KB/Article" in full_url:
                if full_url not in [a[1] for a in articles]:
                    articles.append((text, full_url))
                    
        print(f"\n--- Found {len(categories)} Category Links ---")
        for name, link in categories:
            print(f"Category: {name} -> {link}")
            
        print(f"\n--- Found {len(articles)} Article Links ---")
        for name, link in articles:
            print(f"Article: {name} -> {link}")
            
        browser.close()

if __name__ == "__main__":
    explore()
