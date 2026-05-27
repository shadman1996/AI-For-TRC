import sys
import os
import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from tdx_api import TDXConnector

def list_apps():
    t = TDXConnector()
    token = t.get_token()
    if not token:
        print("Failed to acquire token.")
        return
        
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Try different endpoints to list apps
    endpoints = [
        "/applications",
        "/users/me/applications",
        "/users/applications"
    ]
    
    for ep in endpoints:
        url = f"{t.base_url}{ep}"
        print(f"Querying endpoint: {url}")
        try:
            res = requests.get(url, headers=headers, timeout=10)
            print(f"Status Code: {res.status_code}")
            if res.status_code == 200:
                print("SUCCESS!")
                print(res.json())
            else:
                print(f"Response: {res.text[:300]}")
        except Exception as e:
            print(f"Exception on {ep}: {e}")

if __name__ == "__main__":
    list_apps()
