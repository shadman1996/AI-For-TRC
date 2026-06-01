import sys
sys.path.insert(0, '.')
from tdx_api import TDXConnector
import requests
import json

def test_kb_api():
    conn = TDXConnector()
    token = conn.get_token()
    if not token:
        print("Failed to get TDX API token.")
        return
        
    print(f"Token obtained successfully! Override appId: 180")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 1. Search KB Articles
    url_search = f"{conn.base_url}/180/kb/search"
    payload = {
        "MaxResults": 200,
        "IsActive": True
    }
    
    print(f"\n--- Testing POST {url_search} ---")
    try:
        res = requests.post(url_search, json=payload, headers=headers, timeout=10)
        print("Status Code:", res.status_code)
        if res.status_code == 200:
            articles = res.json()
            print(f"Success! Found {len(articles)} articles via search.")
            if articles:
                print("Sample article Subject:", articles[0].get("Subject"))
                print("Sample article ID:", articles[0].get("ID"))
            return
        else:
            print("Response:", res.text)
    except Exception as e:
        print("Exception:", e)
        
    # 2. Get KB Articles list
    url_list = f"{conn.base_url}/180/kb"
    print(f"\n--- Testing GET {url_list} ---")
    try:
        res = requests.get(url_list, headers=headers, timeout=10)
        print("Status Code:", res.status_code)
        if res.status_code == 200:
            articles = res.json()
            print(f"Success! Found {len(articles)} articles via list.")
            return
        else:
            print("Response:", res.text)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    test_kb_api()
