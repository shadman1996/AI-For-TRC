import sys
import os
import sqlite3
import urllib.parse
import time
from playwright.sync_api import sync_playwright

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trc_ai.db"))
USER_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "playwright_user_data"))

def safe_print(msg):
    sys.stdout.buffer.write((msg + '\n').encode('utf-8', errors='ignore'))

def run_deep_crawl_headed():
    search_url = "https://services.smsu.edu/TDClient/180/Portal/KB/Search"
    safe_print(f"=== Starting Authenticated Deep KB Search Ingestion ===")
    safe_print(f"Target DB: {DB_PATH}")
    safe_print(f"Persistent User Data Dir: {USER_DATA_DIR}")
    
    article_urls = []
    
    with sync_playwright() as p:
        safe_print("Launching Chromium browser in HEADED mode...")
        # Launching with persistent context so logins/cookies are saved
        context = p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            headless=False,
            viewport={"width": 1280, "height": 800}
        )
        
        # Get active page or create one
        page = context.pages[0] if context.pages else context.new_page()
        
        safe_print(f"Navigating to {search_url}...")
        page.goto(search_url, timeout=45000)
        
        # Show prominent user instructions
        safe_print("\n" + "="*80)
        safe_print("🔑 ACTION REQUIRED: PLEASE SIGN IN TO THE SMSU HELP DESK CLIENT PORTAL 🔑")
        safe_print("="*80)
        safe_print("A headed browser window has been launched.")
        safe_print("To crawl the complete list of 121 Help Desk Knowledge Base articles:")
        safe_print("")
        safe_print("1. Click 'Sign In' at the top-right corner of the TeamDynamix page.")
        safe_print("2. Log in using your SMSU StarID and complete the Microsoft MFA authentication.")
        safe_print("3. Once logged in, go back to the Search page:")
        safe_print(f"   {search_url}")
        safe_print("4. Clear the search text box and click the 'Search' button.")
        safe_print("5. Verify that it says something like '121 articles found' or lists all 121")
        safe_print("   articles across multiple pages.")
        safe_print("6. Return here to this terminal and press [ENTER] to start crawling!")
        safe_print("="*80 + "\n")
        
        input("Press [ENTER] after you have logged in, searched, and can see the 121 articles list...")
        
        safe_print("\nScanning search results pagination for all articles...")
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
                    if "ArticleDet" in full_url or "Article/" in full_url or "ArticleDet" in href or "Article/" in href:
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
                    
            if page_articles == 0:
                safe_print("DEBUG: Dumping first 20 links found on the page:")
                for i, link in enumerate(links[:20]):
                    try:
                        safe_print(f" - [{i}] text: '{link.inner_text().strip()}', href: '{link.get_attribute('href')}'")
                    except:
                        pass
                        
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
        if len(article_urls) >= 120:
            safe_print(f"🌟 Excellent! Found the complete enterprise catalog of {len(article_urls)} articles.")
        else:
            safe_print(f"⚠️ Collected {len(article_urls)} articles. (Public-only is 64; Full-enterprise is 121).")
        
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
            
        context.close()
        
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
    run_deep_crawl_headed()
