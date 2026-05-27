import sys
import os
import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from tdx_api import TDXConnector

def scan_apps():
    t = TDXConnector()
    token = t.get_token()
    if not token:
        print("Failed to get TDX token.")
        return
        
    print(f"Token acquired. Scanning application IDs from 1 to 2000...")
    
    # We will test in chunks or iterate quickly
    for appid in range(1, 2001):
        url = f"{t.base_url}/{appid}/tickets/search"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        try:
            res = requests.post(url, json={"MaxResults": 1}, headers=headers, timeout=2)
            if res.status_code == 200:
                print(f"🌟 SUCCESS! Authorized Ticketing App ID found: {appid}")
                print(res.json()[:1])
            elif res.status_code == 403:
                # App exists but we have no access, or it is not authorized
                pass
            elif res.status_code == 400:
                # App exists but is not a ticketing app
                pass
            elif res.status_code == 404:
                # App does not exist
                pass
        except Exception as e:
            pass

    print("Scan complete.")

if __name__ == "__main__":
    scan_apps()
