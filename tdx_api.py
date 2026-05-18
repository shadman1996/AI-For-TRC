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
        
        # Load config
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.tdx_config = self.config.get("tdx", {})
        self.username = self.tdx_config.get("username", "TRChelpdesk")
        self.beid = self.tdx_config.get("beid")
        self.wskey = self.tdx_config.get("wskey")
        self.appid = self.tdx_config.get("appid", "180")
        self.ipaas_secret = self.tdx_config.get("ipaas_secret")

    def _decrypt_value(self, val):
        if val and val.startswith("ENC("):
            return self.sm.decrypt(val)
        return val

    def get_token(self):
        """Authenticates with TDX using standard auth, with admin auth as fallback."""
        now = time.time()
        if self.token and now < self.token_expiry - 60:
            return self.token

        wskey = self._decrypt_value(self.wskey)
        beid = self._decrypt_value(self.beid)

        if not wskey:
            logging.error("TDX WSKey/Password missing in config.json")
            return None

        # Method A: Try standard user authentication (matches PullCurrentTDXInfo.ps1)
        try:
            auth_url = f"{self.base_url}/auth"
            payload = {
                "username": self.username,
                "password": wskey
            }
            logging.info(f"Attempting standard TDX auth for user '{self.username}' at {auth_url}...")
            res = requests.post(auth_url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
            if res.status_code == 200:
                self.token = res.text.strip('"')
                self.token_expiry = now + 3600
                logging.info("TDX Standard Authentication Successful")
                return self.token
            else:
                logging.warning(f"TDX Standard Auth returned status {res.status_code}: {res.text}. Trying Admin Auth fallback...")
        except Exception as e:
            logging.warning(f"TDX Standard Auth Exception: {str(e)}. Trying Admin Auth fallback...")

        # Method B: Fallback to Admin loginadmin authentication (matches SCCM-To-TDX-MACs.ps1)
        if not beid:
            logging.error("TDX BEID missing; cannot perform Admin Auth fallback.")
            return None

        try:
            auth_url = f"{self.base_url}/auth/loginadmin"
            payload = {
                "BEID": beid,
                "WebServicesKey": wskey
            }
            logging.info(f"Attempting Admin TDX auth at {auth_url}...")
            res = requests.post(auth_url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
            if res.status_code == 200:
                self.token = res.text.strip('"')
                self.token_expiry = now + 3600
                logging.info("TDX Admin Authentication Successful")
                return self.token
            else:
                logging.error(f"TDX Admin Auth Failed: {res.status_code} - {res.text}")
                return None
        except Exception as e:
            logging.error(f"TDX Admin Auth Exception: {str(e)}")
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
        
        # Default search for "New" (1), "Open" (2), and "In Process" (3)
        payload = {
            "StatusIDs": status_ids or [1, 2, 3],
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
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                return res.json()
            return []
        except Exception as e:
            return []
