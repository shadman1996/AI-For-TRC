from playwright.sync_api import sync_playwright
import sqlite3
import urllib.parse
import sys
import os
import argparse
import time

# Absolute path to TRC AI Assistant DB
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trc_ai.db"))

def safe_print(msg):
    """UTF-8 safe printing to prevent Windows console encoding crashes."""
    sys.stdout.buffer.write((msg + '\n').encode('utf-8', errors='ignore'))

class SMSUKBCrawler:
    def __init__(self, limit=None, dry_run=False):
        self.root_url = "https://services.smsu.edu/TDClient/180/Portal/KB/Category/789/Information-Technology-Services"
        self.limit = limit
        self.dry_run = dry_run
        self.visited_categories = set()
        self.visited_articles = set()
        self.articles_to_scrape = []
        self.scraped_count = 0
        
    def run(self):
        safe_print(f"=== Starting SMSU Knowledge Base Crawl ===")
        safe_print(f"Target DB: {DB_PATH}")
        if self.dry_run:
            safe_print("DRY RUN ACTIVE: No database changes will be committed.")
        if self.limit:
            safe_print(f"Article Limit Active: Crawling max {self.limit} articles.")
            
        with sync_playwright() as p:
            safe_print("Launching Chromium Headless Browser...")
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Phase 1: Recursive Category Traversal to find all Article URLs
            category_queue = [self.root_url]
            safe_print("\n--- Phase 1: Crawling Categories & Gathering Article Links ---")
            
            while category_queue:
                current_cat_url = category_queue.pop(0)
                if current_cat_url in self.visited_categories:
                    continue
                
                self.visited_categories.add(current_cat_url)
                safe_print(f"Exploring Category Page: {current_cat_url}")
                
                try:
                    page.goto(current_cat_url, timeout=20000)
                    page.wait_for_load_state("networkidle", timeout=10000)
                except Exception as e:
                    safe_print(f"⚠️ Page load error on {current_cat_url}: {e}")
                    continue
                
                # Extract links
                links = page.locator("a").all()
                for link in links:
                    try:
                        href = link.get_attribute("href")
                        if not href or href.startswith("#") or "javascript:void" in href:
                            continue
                        
                        full_url = urllib.parse.urljoin(current_cat_url, href)
                        
                        # Category link check
                        if "/KB/Category/" in full_url:
                            # Avoid parent directory or other categories outside SMSU IT KB
                            # Category ID: /Category/XYZ/
                            if full_url not in self.visited_categories and full_url not in category_queue:
                                # We only crawl under the base SMSU Portal
                                if "services.smsu.edu/TDClient/180/Portal/KB/" in full_url:
                                    category_queue.append(full_url)
                                    
                        # Article link check
                        elif "/KB/Article/" in full_url or "/KB/ArticleDet" in full_url:
                            # Standardize URL (strip anchor query string if any)
                            clean_url = full_url.split('#')[0].split('?')[0]
                            if clean_url not in self.visited_articles and clean_url not in self.articles_to_scrape:
                                self.articles_to_scrape.append(clean_url)
                                
                    except Exception as e:
                        continue
                
                time.sleep(0.3) # Polite crawl delay
                
            safe_print(f"\nPhase 1 Complete. Found {len(self.articles_to_scrape)} unique article links!")
            
            # Phase 2: Scrape details for each article
            safe_print("\n--- Phase 2: Ingesting Article Content ---")
            
            scraped_data = []
            for article_url in self.articles_to_scrape:
                if self.limit and self.scraped_count >= self.limit:
                    safe_print(f"Reached scraping limit of {self.limit} articles.")
                    break
                    
                safe_print(f"Scraping Article [{self.scraped_count + 1}]: {article_url}")
                
                try:
                    page.goto(article_url, timeout=20000)
                    page.wait_for_selector("h1", timeout=10000)
                except Exception as e:
                    safe_print(f"⚠️ Failed to load article page {article_url}: {e}")
                    continue
                
                try:
                    # 1. Title
                    title = page.locator("h1").inner_text().strip()
                    
                    # 2. Breadcrumbs
                    breadcrumbs = []
                    bc_elements = page.locator(".breadcrumb li").all()
                    for bc in bc_elements:
                        breadcrumbs.append(bc.inner_text().strip())
                    breadcrumb_path = " > ".join(breadcrumbs) if breadcrumbs else "Knowledge Base"
                    
                    # 3. Tags
                    tags = ""
                    tags_elem = page.locator("#ctl00_ctl00_cpContent_cpContent_divTags")
                    if tags_elem.count() > 0:
                        tags = tags_elem.inner_text().replace("Tags", "").strip()
                        tags = ", ".join([t.strip() for t in tags.split() if t.strip()])
                        
                    # 4. Clean body text
                    body = ""
                    body_elem = page.locator("#ctl00_ctl00_cpContent_cpContent_divBody")
                    if body_elem.count() > 0:
                        body = body_elem.inner_text().strip()
                    else:
                        # Fallback
                        main_elem = page.locator("main")
                        if main_elem.count() > 0:
                            body = main_elem.inner_text().strip()
                        else:
                            body = page.locator("body").inner_text().strip()
                    
                    if not title or not body:
                        safe_print(f"⚠️ Empty title or body for {article_url}. Skipping.")
                        continue
                        
                    # Format as standard TRC AI RAG block
                    # Embed original official URL so AI can point users to the exact official steps!
                    kb_block = (
                        f"**{title}**<br>"
                        f"🔗 **Official KB Article**: {article_url}<br>"
                        f"Category: {breadcrumb_path}<br>"
                        f"Tags: {tags if tags else 'None'}<br><br>"
                        f"{body}"
                    )
                    
                    scraped_data.append(kb_block)
                    self.scraped_count += 1
                    
                    # Log success
                    safe_print(f"✅ Ingested: '{title}' ({len(body)} chars)")
                    
                except Exception as e:
                    safe_print(f"⚠️ Scraping parse failed for {article_url}: {e}")
                    
                time.sleep(0.5) # Polite crawl delay
                
            browser.close()
            
            # Phase 3: DB Ingestion
            if scraped_data and not self.dry_run:
                safe_print(f"\n--- Phase 3: Writing to Database ({len(scraped_data)} records) ---")
                try:
                    conn = sqlite3.connect(DB_PATH)
                    cursor = conn.cursor()
                    
                    # Prevent duplicates by clearing older crawled entries
                    cursor.execute("DELETE FROM kb WHERE source = 'SMSU KB Scraper'")
                    
                    # Batch insert
                    cursor.executemany(
                        "INSERT INTO kb (content, source) VALUES (?, 'SMSU KB Scraper')",
                        [(data,) for data in scraped_data]
                    )
                    conn.commit()
                    
                    # Check final count
                    final_count = cursor.execute("SELECT count(*) FROM kb").fetchone()[0]
                    conn.close()
                    safe_print(f"🎉 SQLite Database updated! Active KB rows: {final_count}")
                    
                except Exception as e:
                    safe_print(f"❌ Database transaction failed: {e}")
            else:
                safe_print("\n--- Crawl Finished (Dry Run / No Articles Scraped) ---")
                
            safe_print(f"Crawl Summary: {self.scraped_count} articles successfully imported to permanent memory.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SMSU KB Recursive Crawler & RAG Memory Ingestor")
    parser.add_argument("--limit", type=int, default=None, help="Max number of articles to scrape")
    parser.add_argument("--dry-run", action="store_true", help="Perform crawl without database insertion")
    args = parser.parse_args()
    
    crawler = SMSUKBCrawler(limit=args.limit, dry_run=args.dry_run)
    crawler.run()
