from playwright.sync_api import sync_playwright

def inspect_article():
    url = "https://services.smsu.edu/TDClient/180/Portal/KB/Article/4837/Make-Me-Admin-Instructions"
    print(f"Opening browser to inspect article: {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, timeout=30000)
        page.wait_for_selector("h1, .breadcrumb")
        
        # Extract title
        title = page.locator("h1").inner_text().strip()
        print(f"Title: {title}")
        
        # Extract breadcrumbs
        breadcrumbs = []
        bc_elements = page.locator(".breadcrumb li").all()
        for bc in bc_elements:
            breadcrumbs.append(bc.inner_text().strip())
        breadcrumb_str = " > ".join(breadcrumbs)
        print(f"Breadcrumbs: {breadcrumb_str}")
        
        # Extract body - let's see what container holds the article content in TeamDynamix
        # Often it is in a div with id "divContent" or "ctl00_cpContent_divContent" or a class like .content-article or .kb-article
        # Let's inspect class/id names or page content
        body_content = ""
        # Let's check potential containers
        containers = ["#divContent", ".kb-article", ".article-body", "#ctl00_cpContent_divContent", ".article-content", ".content"]
        for c in containers:
            elem = page.locator(c)
            if elem.count() > 0:
                print(f"Found container: {c}")
                body_content = elem.first.inner_text().strip()
                break
                
        if not body_content:
            # Fallback: get text of the main content area
            main = page.locator("main")
            if main.count() > 0:
                print("Fallback: Using <main>")
                body_content = main.first.inner_text().strip()
            else:
                print("Fallback: Using body")
                body_content = page.locator("body").inner_text().strip()
                
        print(f"\n--- Body Preview (first 500 chars) ---")
        print(body_content[:500])
        
        browser.close()

if __name__ == "__main__":
    inspect_article()
