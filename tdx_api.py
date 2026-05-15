import requests
import json
import logging
import time
from datetime import datetime
from security import SecurityManager

class TDXConnector:
    def __init__(self, config_path="config.json"):
        self.config_path = config_path
        self.sm = SecurityManager()
        self.token = None
        self.token_expiry = 0
        self.base_url = "https://services.smsu.edu/TDWebApi/api"
        self.auth_url = f"{self.base_url}/auth/loginadmin"
        
        # Load config
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.tdx_config = self.config.get("tdx", {})
        self.beid = self.tdx_config.get("beid")
        self.wskey = self.tdx_config.get("wskey")
        self.appid = self.tdx_config.get("appid", "180")
        self.ipaas_secret = self.tdx_config.get("ipaas_secret")

    def _decrypt_value(self, val):
        if val and val.startswith("ENC("):
            return self.sm.decrypt(val)
        return val

    def get_token(self):
        """Authenticates with TDX and returns a Bearer token."""
        now = time.time()
        if self.token and now < self.token_expiry - 60:
            return self.token

        beid = self._decrypt_value(self.beid)
        wskey = self._decrypt_value(self.wskey)

        if not beid or not wskey:
            logging.error("TDX Credentials missing in config.json")
            return None

        try:
            payload = {
                "BEID": beid,
                "WebServicesKey": wskey
            }
            res = requests.post(self.auth_url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
            if res.status_code == 200:
                self.token = res.text.strip('"') # TDX returns token as a quoted string
                self.token_expiry = now + 3600 # Assume 1 hour expiry
                logging.info("TDX Authentication Successful")
                return self.token
            else:
                logging.error(f"TDX Auth Failed: {res.status_code} - {res.text}")
                return None
        except Exception as e:
            logging.error(f"TDX Auth Exception: {str(e)}")
            return None

    def get_tickets(self, status_ids=None):
        """Fetches tickets from the TDX API."""
        token = self.get_token()
        if not token: return []

        url = f"{self.base_url}/{self.appid}/tickets/search"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Default search for "New" (1) and "In Process" (2)
        payload = {
            "StatusIDs": status_ids or [1, 2],
            "MaxResults": 50
        }

        try:
            res = requests.post(url, json=payload, headers=headers, timeout=15)
            if res.status_code == 200:
                return res.json()
            else:
                logging.error(f"TDX Ticket Fetch Failed: {res.status_code}")
                return []
        except Exception as e:
            logging.error(f"TDX Ticket Exception: {str(e)}")
            return []

    def get_ticket_feed(self, ticket_id):
        """Fetches the activity feed (comments) for a specific ticket."""
        token = self.get_token()
        if not token: return []

        url = f"{self.base_url}/{self.appid}/tickets/{ticket_id}/feed"
        headers = {
            "Authorization": f"Bearer {token}"
        }

        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                return res.json()
            return []
        except Exception as e:
            return []

    def add_comment(self, ticket_id, body, is_private=False):
        """Adds a comment to a ticket feed."""
        token = self.get_token()
        if not token: return False

        url = f"{self.base_url}/{self.appid}/tickets/{ticket_id}/feed"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "Body": body,
            "IsPrivate": is_private,
            "Notify": [] # Can be extended to notify requestor etc.
        }

        try:
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            return res.status_code in [200, 201]
        except Exception as e:
            logging.error(f"TDX Comment Exception: {str(e)}")
            return False

    def trigger_ipaas_flow(self, flow_id, payload):
        """Triggers a TDX iPaaS flow using the secret key."""
        if not self.ipaas_secret:
            logging.error("TDX iPaaS Secret missing")
            return None

        secret = self._decrypt_value(self.ipaas_secret)
        url = f"https://us1.teamdynamix.com/tdapp/app/flow/api/2/start/{flow_id}" # Example URL pattern
        
        headers = {
            "X-TdxiPaaS-Secret": secret,
            "Content-Type": "application/json"
        }

        try:
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            return res.json()
        except Exception as e:
            logging.error(f"TDX iPaaS Exception: {str(e)}")
            return None
