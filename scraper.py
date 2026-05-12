from playwright.sync_api import sync_playwright
import time
import json

def scrape_starid_admin(query: str, username: str, password: str):
    print(f"Initializing Headless Browser to scrape StarID Admin for {query}...")
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            
            print("Navigating to StarID Admin...")
            page.goto("https://starid.minnstate.edu/admin/", timeout=15000)
            
            # Login
            page.fill("#starid", username)
            page.fill("#pw", password)
            page.click(".btn-primary")
            
            # Wait for search page
            page.wait_for_selector("input#starid")
            print(f"Searching for StarID: {query}")
            page.fill("input#starid", query)
            page.click("button.btn-primary")
            
            # Wait for results and click the detail link
            page.wait_for_selector("div#results")
            if "StarID accounts found: 0" in page.content():
                 return {"status": "error", "message": f"No users found matching '{query}' in StarID Admin."}
            
            page.locator("#results table tbody tr td a").first.click()
            page.wait_for_selector("h3") # User detail header
            
            # Scrape all key-value pairs on the page
            details = {}
            # Loop through all rows that have a label span and a value div
            # We look for rows that contain a label span
            rows = page.locator("div.row").all()
            for row in rows:
                try:
                    span = row.locator("span").first
                    if span.count() > 0:
                        label = span.inner_text().strip().rstrip(':')
                        if label:
                            # The value is in a sibling div or a div within the same row that doesn't have the label span
                            divs = row.locator("div[class*='col-sm-']").all()
                            for d in divs:
                                if d.locator("span").count() == 0:
                                    val = d.inner_text().strip()
                                    # Clean up extra whitespace
                                    val = " ".join(val.split())
                                    if val:
                                        details[label] = val
                                        break
                except:
                    continue

            # Normalize the data structure
            data = {
                "Name": page.locator("h3").first.inner_text().strip() if page.locator("h3").count() > 0 else "Unknown User",
                "StarID": details.get("StarID", query),
                "Email": details.get("Notification Email", details.get("Email List", "N/A")),
                "PasswordExpires": details.get("Password Expires", "N/A"),
                "Affiliations": details.get("ISRS Affiliation List", "N/A"),
                "ActivationStatus": details.get("Activation Status", "N/A"),
                "LastLogon": details.get("Last Logon", "N/A"),
                "TechID": details.get("TechID List", "N/A"),
                "LibraryBarcode": details.get("Library Barcodes", "N/A"),
                "Title": details.get("Title", "N/A"),
                "Department": details.get("Department", "N/A"),
                "Source": "StarID Admin Scraper"
            }
            
            browser.close()
            return {"status": "success", "data": [data]}
            
    except Exception as e:
        if 'browser' in locals():
            browser.close()
        return {"status": "error", "message": f"Scraping failed: {str(e)}"}

if __name__ == "__main__":
    # Test with provided credentials
    res = scrape_starid_admin("vg6340ah", "vg6340ah", "Temp@2026!!")
    print(json.dumps(res, indent=2))
