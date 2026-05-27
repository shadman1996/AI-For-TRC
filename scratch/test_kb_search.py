import requests
import json
import sys

def safe_print(msg):
    sys.stdout.buffer.write((msg + '\n').encode('utf-8', errors='ignore'))

def test_search(query):
    url = f"http://localhost:8001/api/kb/search?q={query}"
    print(f"\n--- Testing Search for: '{query}' ---")
    try:
        res = requests.get(url, timeout=5)
        print(f"Status Code: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            safe_print(json.dumps(data, indent=2))
        else:
            print("Error:", res.text)
    except Exception as e:
        print("Failed to connect:", e)

if __name__ == "__main__":
    # Test queries
    test_search("Make Me Admin")
    test_search("MFA")
    test_search("StarID Password")
