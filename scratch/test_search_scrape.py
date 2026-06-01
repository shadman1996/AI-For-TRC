from playwright.sync_api import sync_playwright
import urllib.parse
import time

def explore_search():
    search_url = "https://services.smsu.edu/TDClient/180/Portal/KB/Search"
    print("Launching Chromium...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print(f"Navigating to {search_url}...")
        page.goto(search_url, timeout=30000)
        
        # Click search button with empty text to list all articles
        print("Clicking search button with empty query...")
        search_btn = page.locator("#ctl00_ctl00_cpContent_cpContent_btnSearch")
        if search_btn.count() > 0:
            search_btn.click()
        else:
            print("Search button not found by ID. Clicking any search input button...")
            page.locator("input[type='submit']").first.click()
            
        print("Waiting for results to load...")
        page.wait_for_timeout(4000)
        
        # Print page title and current URL
        print("Current URL:", page.url)
        print("Page Title:", page.title())
        
        # Save search results HTML for inspection
        with open("search_results.html", "w", encoding="utf-8") as f:
            f.write(page.content())
        print("Saved search_results.html")
        
        # Look for article links
        print("Scanning links on search result page...")
        links = page.locator("a").all()
        articles = []
        for link in links:
            href = link.get_attribute("href")
            text = link.inner_text().strip()
            if href:
                full_url = urllib.parse.urljoin(page.url, href)
                if "/KB/ArticleDet" in full_url or "/KB/Article/" in full_url:
                    articles.append((text, full_url))
                    
        print(f"\nFound {len(articles)} article links in search page:")
        for text, url in articles[:20]:
            print(f" - {text} -> {url}")
            
        # Check if there is pagination
        pagination_links = page.locator(".pagination a, a:has-text('Next'), a:has-text('>')").all()
        print(f"\nFound {len(pagination_links)} pagination/next links.")
        for p_link in pagination_links[:5]:
            print("Pagination link text:", p_link.inner_text().strip(), "href:", p_link.get_attribute("href"))
            
        browser.close()

if __name__ == "__main__":
    explore_search()
