from playwright.sync_api import sync_playwright
import time
import json

import sys

def scrape_starid_admin(query: str, username: str, password: str):
    # Safe print to avoid charmap errors on Windows console
    safe_print = lambda msg: sys.stdout.buffer.write((msg + '\n').encode('utf-8', errors='ignore'))
    
    safe_print(f"Initializing Headless Browser to scrape StarID Admin for {query}...")
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            
            safe_print("Navigating to StarID Admin...")
            page.goto("https://starid.minnstate.edu/admin/", timeout=15000)
            
            # Login
            page.fill("#starid", username)
            page.fill("#pw", password)
            page.click(".btn-primary")
            
            # Wait for search page
            page.wait_for_selector("input#starid")
            safe_print(f"Searching for StarID: {query}")
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

            # Normalize the data structure safely
            name_text = "Unknown User"
            if page.locator("h3").count() > 0:
                raw_name = page.locator("h3").first.inner_text()
                name_text = raw_name.encode('ascii', 'ignore').decode('ascii').strip()
                
            data = {
                "Status": details.get("Activation Status", "Active").split(' ')[0],
                "Name": name_text,
                "StarID": details.get("StarID", query).encode('ascii', 'ignore').decode('ascii'),
                "FirstName": details.get("First Name", "N/A"),
                "InformalName": details.get("Informal Name", "N/A"),
                "MiddleName": details.get("Middle Name", "N/A"),
                "LastName": details.get("Last Name", "N/A"),
                "ActivationStatus": details.get("Activation Status", "N/A"),
                "LockStatus": details.get("Lock Status", "N/A"),
                "Decommissioned": details.get("Decommissioned", "N/A"),
                "PasswordExpires": details.get("Password Expires", "N/A"),
                "NotificationEmail": details.get("Notification Email", "N/A"),
                "EmailList": details.get("Email List", "N/A"),
                "TechID": details.get("TechID List", "N/A"),
                "LibraryBarcode": details.get("Library Barcodes", "N/A"),
                "StateEmployeeNumber": details.get("State Employee Number", "N/A"),
                "Affiliations": details.get("ISRS Affiliation List", "N/A"),
                "ExtraAffiliationList": details.get("Extra Affiliation List", "N/A"),
                "CohortList": details.get("Cohort List", "N/A"),
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
