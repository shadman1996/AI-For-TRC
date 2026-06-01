from playwright.sync_api import sync_playwright
import sys

def inspect_article():
    url = "https://services.smsu.edu/TDClient/180/Portal/KB/Article/4837/Make-Me-Admin-Instructions"
    print(f"Opening browser to inspect article: {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, timeout=30000)
        page.wait_for_selector("h1, .breadcrumb")
        
        # Get elements under <main> to see classes
        main_children = page.locator("main *").all()
        classes = set()
        ids = set()
        for elem in main_children:
            try:
                c = elem.get_attribute("class")
                if c:
                    classes.update(c.split())
                i = elem.get_attribute("id")
                if i:
                    ids.add(i)
            except:
                pass
                
        with open("scratch/article_structure.txt", "w", encoding="utf-8") as f:
            f.write(f"Title: {page.locator('h1').inner_text().strip()}\n")
            f.write("Classes under <main>:\n")
            for c in sorted(classes):
                f.write(f"  .{c}\n")
            f.write("IDs under <main>:\n")
            for i in sorted(ids):
                f.write(f"  #{i}\n")
                
            # Let's also fetch the text content of <main> to check what it contains
            main_text = page.locator("main").inner_text().strip()
            f.write("\n--- Main Text Content ---\n")
            f.write(main_text)
            
        print("Done! Saved structure and content to scratch/article_structure.txt")
        browser.close()

if __name__ == "__main__":
    inspect_article()
