import sys
import os
import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from tdx_api import TDXConnector

def test_admin():
    t = TDXConnector()
    wskey = t._decrypt_value(t.wskey)
    beid = t._decrypt_value(t.beid)
    
    # Override base URL to central MinnState
    minnstate_base_url = "https://services.minnstate.edu/TDWebApi/api"
    
    print("Testing Method B (loginadmin) Authentication on MinnState base URL...")
    auth_url = f"{minnstate_base_url}/auth/loginadmin"
    payload = {
        "BEID": beid,
        "WebServicesKey": wskey
    }
    
    try:
        res = requests.post(auth_url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
        print(f"loginadmin response code: {res.status_code}")
        if res.status_code == 200:
            token = res.text.strip('"')
            print("Token generated successfully.")
            
            # Query App 181 tickets
            url = f"{minnstate_base_url}/181/tickets/search"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            sr = requests.post(url, json={"MaxResults": 3}, headers=headers, timeout=10)
            print(f"App 181 Search status: {sr.status_code}")
            if sr.status_code == 200:
                print("App 181 Tickets fetched successfully:")
                print(sr.json()[:2])
            else:
                print(f"App 181 error message: {sr.text}")
        else:
            print(f"loginadmin error message: {res.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_admin()
