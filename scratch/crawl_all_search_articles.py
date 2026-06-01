from playwright.sync_api import sync_playwright
import sqlite3
import urllib.parse
import sys
import os
import time

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trc_ai.db"))

def safe_print(msg):
    sys.stdout.buffer.write((msg + '\n').encode('utf-8', errors='ignore'))

def run_deep_crawl():
    search_url = "https://services.smsu.edu/TDClient/180/Portal/KB/Search"
    safe_print(f"=== Starting Deep Search Ingestion ===")
    safe_print(f"Target DB: {DB_PATH}")
    
    article_urls = []
    
    with sync_playwright() as p:
        safe_print("Launching Chromium browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        safe_print(f"Navigating to {search_url}...")
        page.goto(search_url, timeout=30000)
        
        # Click search
        safe_print("Triggering search to list all active articles...")
        search_btn = page.locator("#ctl00_ctl00_cpContent_cpContent_btnSearch")
        if search_btn.count() > 0:
            search_btn.click()
        else:
            page.locator("input[type='submit']").first.click()
            
        page.wait_for_timeout(4000)
        
        # Paginate and collect URLs
        page_num = 1
        while True:
            safe_print(f"Scanning Page {page_num}...")
            
            # Find all links on the current page
            links = page.locator("a").all()
            page_articles = 0
            for link in links:
                try:
                    href = link.get_attribute("href")
                    if not href:
                        continue
                    
                    full_url = urllib.parse.urljoin(page.url, href)
                    if "/KB/ArticleDet" in full_url or "/KB/Article/" in full_url:
                        # Keep query string for ArticleDet to preserve ?ID=
                        clean_url = full_url.split('#')[0]
                        if "ArticleDet" in full_url:
                            parsed_url = urllib.parse.urlparse(full_url)
                            params = urllib.parse.parse_qs(parsed_url.query)
                            art_id = params.get("ID") or params.get("id")
                            if art_id:
                                clean_url = f"https://services.smsu.edu/TDClient/180/Portal/KB/ArticleDet?ID={art_id[0]}"
                        else:
                            clean_url = clean_url.split('?')[0]
                            
                        if clean_url not in article_urls:
                            article_urls.append(clean_url)
                            page_articles += 1
                except Exception:
                    continue
                    
            safe_print(f" -> Found {page_articles} new articles on page {page_num}. Total accumulated: {len(article_urls)}")
            
            # Find Next button
            next_btn = page.locator("a:has-text('Next'), a[id*='lnkNext']")
            active_next = None
            if next_btn.count() > 0:
                for idx in range(next_btn.count()):
                    btn = next_btn.nth(idx)
                    if btn.is_visible():
                        active_next = btn
                        break
            
            if active_next:
                safe_print(f"Clicking 'Next' to navigate to page {page_num + 1}...")
                try:
                    # Expect page navigation (reloads the ASP.NET form)
                    with page.expect_navigation(timeout=10000):
                        active_next.click()
                except Exception:
                    # Fallback manual wait if it was AJAX or no standard navigation fired
                    page.wait_for_timeout(4000)
                page_num += 1
            else:
                safe_print("No more pages available. Ingestion search scan complete.")
                break
                
        safe_print(f"\n🎉 Scan finished! Found {len(article_urls)} total unique articles.")
        
        # Phase 2: Scrape details for each article
        safe_print("\n--- Ingesting Article Contents ---")
        scraped_data = []
        scraped_count = 0
        
        for article_url in article_urls:
            scraped_count += 1
            safe_print(f"[{scraped_count}/{len(article_urls)}] Scraping: {article_url}")
            
            try:
                page.goto(article_url, timeout=25000)
                page.wait_for_selector("h1", timeout=12000)
            except Exception as e:
                safe_print(f" ⚠️ Failed to load article: {e}")
                continue
                
            try:
                title = page.locator("h1").inner_text().strip()
                
                # Breadcrumbs
                breadcrumbs = []
                bc_elements = page.locator(".breadcrumb li").all()
                for bc in bc_elements:
                    breadcrumbs.append(bc.inner_text().strip())
                breadcrumb_path = " > ".join(breadcrumbs) if breadcrumbs else "Knowledge Base"
                
                # Tags
                tags = ""
                tags_elem = page.locator("#ctl00_ctl00_cpContent_cpContent_divTags")
                if tags_elem.count() > 0:
                    tags = tags_elem.inner_text().replace("Tags", "").strip()
                    tags = ", ".join([t.strip() for t in tags.split() if t.strip()])
                    
                # Clean body text
                body = ""
                body_elem = page.locator("#ctl00_ctl00_cpContent_cpContent_divBody")
                if body_elem.count() > 0:
                    body = body_elem.inner_text().strip()
                else:
                    main_elem = page.locator("main")
                    if main_elem.count() > 0:
                        body = main_elem.inner_text().strip()
                    else:
                        body = page.locator("body").inner_text().strip()
                        
                if not title or not body:
                    safe_print(f" ⚠️ Empty content parsed. Skipping.")
                    continue
                    
                kb_block = (
                    f"**{title}**<br>"
                    f"🔗 **Official KB Article**: {article_url}<br>"
                    f"Category: {breadcrumb_path}<br>"
                    f"Tags: {tags if tags else 'None'}<br><br>"
                    f"{body}"
                )
                scraped_data.append(kb_block)
                safe_print(f" ✅ Ingested: '{title}' ({len(body)} chars)")
                
            except Exception as e:
                safe_print(f" ⚠️ Parse failed for {article_url}: {e}")
                
            time.sleep(0.4) # Polite crawl delay
            
        browser.close()
        
    # Phase 3: DB Ingestion
    if scraped_data:
        safe_print(f"\n--- Phase 3: Writing to Database ({len(scraped_data)} records) ---")
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM kb WHERE source = 'SMSU KB Scraper'")
            
            cursor.executemany(
                "INSERT INTO kb (content, source) VALUES (?, 'SMSU KB Scraper')",
                [(data,) for data in scraped_data]
            )
            conn.commit()
            
            final_count = cursor.execute("SELECT count(*) FROM kb").fetchone()[0]
            conn.close()
            
            safe_print(f"🎉 SQLite Database updated successfully!")
            safe_print(f"Active KB Rows in Memory: {final_count}")
            safe_print(f"Deep Crawl Ingested: {len(scraped_data)} distinct SMSU help articles.")
        except Exception as e:
            safe_print(f"❌ Database update failed: {e}")
    else:
        safe_print("\n❌ No articles were scraped.")

if __name__ == "__main__":
    run_deep_crawl()
