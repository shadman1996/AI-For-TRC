import requests, json
from tdx_api import TDXConnector

t = TDXConnector()
wskey = t._decrypt_value(t.wskey)

# Standard auth
auth_url = t.base_url + '/auth'
payload = {'username': t.username, 'password': wskey}
res = requests.post(auth_url, json=payload, headers={'Content-Type': 'application/json'}, timeout=10)
print(f'Standard Auth ({t.username}): {res.status_code}')

if res.status_code == 200:
    token = res.text.strip('"')
    
    # Try all possible app IDs
    for appid in range(178, 195):
        url = f'{t.base_url}/{appid}/tickets/search'
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        try:
            sr = requests.post(url, json={'MaxResults': 3}, headers=headers, timeout=5)
            if sr.status_code == 200:
                data = sr.json()
                print(f'  App {appid}: SUCCESS - {len(data)} tickets')
                for x in data[:3]:
                    print(f"    #{x.get('ID')} [{x.get('StatusName')}] {x.get('Title')}")
            elif sr.status_code == 403:
                print(f'  App {appid}: 403 No Access')
            elif sr.status_code == 400:
                msg = sr.json().get('Message', sr.text[:80])
                print(f'  App {appid}: 400 {msg}')
            else:
                print(f'  App {appid}: {sr.status_code}')
        except Exception as e:
            print(f'  App {appid}: Error {e}')
