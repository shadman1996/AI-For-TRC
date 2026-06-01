import sys
sys.path.insert(0, '.')
from tdx_api import TDXConnector
import requests
import json

def test_kb_variations():
    conn = TDXConnector()
    token = conn.get_token()
    if not token:
        print("Failed to get TDX API token.")
        return
        
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Try different routing formats
    variations = [
        # Path with 180 (Client Portal app ID)
        "180/articles",
        "180/articles/search",
        "180/kb/articles",
        "180/kb/articles/search",
        
        # Path with 181 (Ticketing app ID)
        "181/articles",
        "181/articles/search",
        "181/kb/articles",
        "181/kb/articles/search",
        
        # Global paths (no app ID)
        "kb/articles",
        "kb/articles/search",
        "kb/search",
        "articles",
        "articles/search"
    ]
    
    payload = {"MaxResults": 5, "IsActive": True}
    
    for path in variations:
        url = f"{conn.base_url}/{path}"
        print(f"\n--- Testing {url} ---")
        try:
            # First try POST
            res = requests.post(url, json=payload, headers=headers, timeout=5)
            print("POST Status:", res.status_code)
            if res.status_code == 200:
                print("SUCCESS on POST! Sample keys:", list(res.json()[0].keys()) if res.json() else "Empty list")
                continue
        except Exception as e:
            print("POST Exception:", e)
            
        try:
            # Then try GET
            res = requests.get(url, headers=headers, timeout=5)
            print("GET Status:", res.status_code)
            if res.status_code == 200:
                print("SUCCESS on GET! Sample keys:", list(res.json()[0].keys()) if res.json() else "Empty list")
        except Exception as e:
            print("GET Exception:", e)

if __name__ == "__main__":
    test_kb_variations()
