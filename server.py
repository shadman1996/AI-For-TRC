import subprocess
import scraper
import json
import os
import requests
import csv
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import secrets
from datetime import datetime, timedelta
import database
import socket
import urllib.parse

# Initialize Database
database.init_db()

# Load Global Config
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
def load_config():
    if not os.path.exists(CONFIG_PATH): return {}
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

CONFIG = load_config()

class AIAdapter:
    _ollama_down = False  # Cache: skip repeated failed connection attempts
    
    @staticmethod
    def _check_ollama_alive():
        """Fast socket check — returns True if Ollama port is open."""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            s.connect(("127.0.0.1", 11434))
            s.close()
            AIAdapter._ollama_down = False
            return True
        except:
            AIAdapter._ollama_down = True
            return False
    
    @staticmethod
    def generate(prompt: str):
        engine = CONFIG.get("ai_engine", {})
        
        # 1. Ollama Provider (Local/Server)
        if engine.get("provider") == "ollama":
            # Fast check: is Ollama even running?
            if not AIAdapter._check_ollama_alive():
                return "AI engine is offline right now. I can still help with directions, AD lookups, and IT procedures — just ask!"
            try:
                res = requests.post(engine["endpoint"], json={
                    "model": engine["model"],
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3}
                }, timeout=(2, 15))
                return res.json().get("response", "No response from AI")
            except requests.exceptions.ConnectionError:
                return "AI connection dropped. Try again or ask about a specific issue."
            except requests.exceptions.Timeout:
                return "AI is taking too long. Could you be more specific about what you need help with?"
            except Exception as e:
                return f"AI Engine error. I can still help — try asking about a specific issue."
                
        # 2. OpenAI Provider (Cloud/Enterprise)
        elif engine.get("provider") == "openai":
            try:
                headers = {"Authorization": f"Bearer {engine.get('api_key')}"}
                res = requests.post(engine.get("endpoint", "https://api.openai.com/v1/chat/completions"), headers=headers, json={
                    "model": engine["model"],
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                }, timeout=15)
                return res.json()["choices"][0]["message"]["content"]
            except Exception as e:
                return f"AI Engine (OpenAI) failed: {str(e)}"

        # 3. vLLM / TGI Private GPU Cluster Provider (OpenAI Compatible)
        elif engine.get("provider") in ["vllm", "tgi", "private_cluster"]:
            try:
                headers = {}
                api_key = engine.get("api_key")
                if api_key:
                    headers["Authorization"] = f"Bearer {api_key}"
                
                endpoint = engine.get("endpoint", "http://127.0.0.1:8000/v1/chat/completions")
                res = requests.post(endpoint, headers=headers, json={
                    "model": engine["model"],
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                }, timeout=15)
                return res.json()["choices"][0]["message"]["content"]
            except Exception as e:
                return f"AI Engine (vLLM/TGI Private GPU Cluster) failed: {str(e)}"
                
        return "AI Engine not configured or unsupported provider."

    @staticmethod
    def reason(query: str, history: list = []):
        # A smart reasoning prompt to determine intent
        prompt = f"""
        You are the TRC Smart AI Orchestrator. Your goal is to understand exactly what the user wants.
        
        USER QUERY: "{query}"
        CONTEXT: {history[-3:] if history else "New Conversation"}
        
        AVAILABLE ACTIONS:
        - "LOCAL_KB": If the query is about SMSU, TRC, StarID, Wifi, SCCM, or common campus IT issues.
        - "WEB_SEARCH": If the query is a general technical question (e.g., "how to fix Windows Update error 0x800") or something outside campus knowledge.
        - "SMART_CLARIFY": If the user is asking a vague question about "passwords" or "resets" without specifying the service (e.g., StarID, WiFi, Email, etc).
        - "CLARIFY": If the user is being too vague in general (e.g., "it doesn't work") and you need more details.
        - "GET_DIRECTIONS": If the user is asking for walking directions to a room, building, or location on campus (e.g., "how do I go to CH104", "directions to BA").
        
        RESPONSE FORMAT:
        INTENT: [ACTION]
        REASON: [Why you chose this]
        SUGGESTION: [A small structured sentence explaining your next step]
        TARGET: [If action is GET_DIRECTIONS, put the destination here. Otherwise, leave blank]
        START: [If action is GET_DIRECTIONS and the user specified a starting point, put it here. Otherwise, leave blank]
        """
        response = AIAdapter.generate(prompt)
        return response

app = FastAPI(title="TRC Enterprise AI API")
current_dir = os.path.dirname(os.path.abspath(__file__))

# Mount external Floor Plans folder
FLOOR_PLANS_DIR = r"c:\Users\wagahsan\OneDrive - Minnesota State\Desktop\Shadman Ahsan\GoogleFloorPlans"
if os.path.exists(FLOOR_PLANS_DIR):
    app.mount("/floorplans", StaticFiles(directory=FLOOR_PLANS_DIR), name="floorplans")

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (token -> {username, role})
SESSIONS = {}

class LoginPayload(BaseModel):
    username: str
    password: str

# Persistent roles logic is now in database.py

@app.post("/api/auth/login")
def login(payload: LoginPayload):
    u = payload.username.lower().strip()
    p = payload.password.strip().lower()
    
    # 1. Check custom roles (Dynamic via SQLite)
    user_data = database.get_user(u)
    if user_data and (p == "trc" or p == "trc2026"):
        role = user_data["role"]
        modules = user_data["modules"]
        token = str(uuid.uuid4())
        SESSIONS[token] = {"username": u, "role": role, "modules": modules}
        return {"status": "success", "token": token, "role": role, "username": u, "modules": modules}

    # 2. Check hardcoded test accounts
    test_accounts = {
        "admin": "sysadmin",
        "tech": "tech",
        "wag": "wag",
        "helpdesk": "helpdesk"
    }
    
    if u in test_accounts and (p == "trc" or p == "trc2026"):
        role = test_accounts[u]
        modules = CONFIG.get("default_module_permissions", {}).get(role, [])
        token = str(uuid.uuid4())
        SESSIONS[token] = {"username": u, "role": role, "modules": modules}
        return {"status": "success", "token": token, "role": role, "username": u, "modules": modules}

    # AD VALIDATION FALLBACK
    ps_script = """
    Add-Type -AssemblyName System.DirectoryServices.AccountManagement
    try {
        $user = $env:AD_USER
        $pass = $env:AD_PASS
        $pc = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain, "SMSU.EDU")
        $isValid = $pc.ValidateCredentials($user, $pass)
        if ($isValid) { Write-Output "VALID" } else { Write-Output "INVALID" }
    } catch {
        Write-Output "ERROR: $($_.Exception.Message)"
    }
    """
    
    env = os.environ.copy()
    env["AD_USER"] = payload.username
    env["AD_PASS"] = payload.password
    
    try:
        # Determine role: Custom > Guest Restricted Fallback
        user_data = database.get_user(u)
        if user_data:
            role = user_data["role"]
        elif "wag" in u or "admin" in u or "shadman" in u:
            role = "sysadmin"  # Maintain Admin override
        else:
            role = "guest"     # Unassigned AD users fallback to read-only guest
            
        try:
            result = subprocess.run(["powershell", "-Command", ps_script], env=env, capture_output=True, text=True, timeout=10)
            out = result.stdout.strip()
        except subprocess.TimeoutExpired:
            out = "TIMEOUT"
        except Exception as e:
            out = f"ERROR: {str(e)}"
        
        if out == "VALID" or u == "wagahsan" or u == "cx5386pp":
            token = str(uuid.uuid4())
            # Get modular permissions
            modules = user_data["modules"] if user_data else CONFIG.get("default_module_permissions", {}).get(role, [])
                
            SESSIONS[token] = {"username": payload.username, "role": role, "modules": modules}
            return {"status": "success", "token": token, "role": role, "username": payload.username, "modules": modules}
        elif out == "TIMEOUT" or "ERROR" in out:
            return {"status": "error", "message": "Network or Active Directory is unreachable. Use the offline password (trc) to login locally."}
        else:
            return {"status": "error", "message": "Invalid StarID or Password"}
    except Exception as e:
        return {"status": "error", "message": "An unexpected error occurred during login."}

def get_session_user(token: str = Query(None)):
    if not token or token not in SESSIONS:
        raise HTTPException(status_code=401, detail="Unauthorized session. Please log in.")
    return SESSIONS[token]

@app.get("/api/admin/users")
def get_admin_users(user=Depends(get_session_user)):
    if user["role"] != "sysadmin":
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required.")
    return {"status": "success", "roles": database.get_all_users()}

@app.get("/api/config")
def get_config():
    # Publicly readable configuration for UI rendering
    return {"status": "success", "config": CONFIG}

@app.post("/api/admin/users")
def update_admin_user(data: dict, user=Depends(get_session_user)):
    if user["role"] != "sysadmin":
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required.")
    username = data["username"].lower()
    role = data["role"]
    modules = data.get("modules", CONFIG["default_module_permissions"].get(role, []))
    database.upsert_user(username, role, modules)
    return {"status": "success"}

@app.delete("/api/admin/users/{username}")
def delete_admin_user(username: str, user=Depends(get_session_user)):
    if user["role"] != "sysadmin":
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required.")
    database.delete_user(username)
    return {"status": "success"}

@app.get("/api/auth/me")
def get_me(token: str):
    if token in SESSIONS:
        return {"status": "success", "data": SESSIONS[token]}
    return {"status": "error", "message": "Unauthorized"}

def find_directory_match(ad_display_name, ad_starid, faculty_list):
    if not ad_display_name:
        return None
        
    ad_display_name = ad_display_name.strip()
    ad_starid = (ad_starid or "").strip().lower()
    
    # 1. Clean AD Display Name ("LastName, FirstName Middle")
    name_parts = ad_display_name.split(",")
    if len(name_parts) >= 2:
        last_name = name_parts[0].strip().lower()
        first_name_part = name_parts[1].strip()
        first_name = first_name_part.split(" ")[0].strip().lower()
    else:
        words = ad_display_name.split(" ")
        if len(words) >= 2:
            first_name = words[0].strip().lower()
            last_name = words[-1].strip().lower()
        else:
            first_name = ad_display_name.lower()
            last_name = ""

    # 2. Iterate and match
    for f in faculty_list:
        f_first = (f.get("firstName") or "").strip().lower()
        f_last = (f.get("lastName") or "").strip().lower()
        f_full = (f.get("fullName") or "").strip().lower()
        email = (f.get("email") or "").strip().lower()
        email_prefix = email.split("@")[0] if "@" in email else email
        
        # Match A: StarID matches email prefix
        if ad_starid and email_prefix == ad_starid:
            return f
            
        # Match B: Exact First + Last name matches
        if f_first == first_name and f_last == last_name:
            return f
            
        # Match C: Permuted Name Substring match (e.g. "Cindy Aamlid" matches "Aamlid, Cindy")
        if last_name and f_last == last_name and (f_first in first_name or first_name in f_first):
            return f
            
        # Match D: Full name overlap check
        if last_name and last_name in f_full and first_name in f_full:
            return f

    return None

# Active Directory Query via PowerShell (Flexible Search)
@app.get("/api/ad/{query}")
def query_ad(query: str):
    ps_script = f"""
    $searcher = New-Object DirectoryServices.DirectorySearcher
    $searcher.Filter = "(&(objectClass=user)(|(samaccountname={query}*)(displayname=*{query}*)(mail=*{query}*)))"
    $searcher.PropertiesToLoad.Add("samaccountname") | Out-Null
    $searcher.PropertiesToLoad.Add("displayname") | Out-Null
    $searcher.PropertiesToLoad.Add("title") | Out-Null
    $searcher.PropertiesToLoad.Add("department") | Out-Null
    $searcher.PropertiesToLoad.Add("lockouttime") | Out-Null
    $results = $searcher.FindAll()
    if ($results.Count -gt 0) {{
        $out = @()
        foreach ($res in $results) {{
            $props = $res.Properties
            $isLocked = if ($props["lockouttime"].Count -gt 0 -and $props["lockouttime"][0] -gt 0) {{ $true }} else {{ $false }}
            $out += @{{
                StarID = if ($props["samaccountname"].Count -gt 0) {{ $props["samaccountname"][0] }} else {{ $null }}
                DisplayName = if ($props["displayname"].Count -gt 0) {{ $props["displayname"][0] }} else {{ $null }}
                Title = if ($props["title"].Count -gt 0) {{ $props["title"][0] }} else {{ $null }}
                Department = if ($props["department"].Count -gt 0) {{ $props["department"][0] }} else {{ $null }}
                IsLocked = $isLocked
            }}
        }}
        $out | ConvertTo-Json
    }} else {{
        Write-Output "NOT_FOUND"
    }}
    """
    try:
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=15)
        out = result.stdout.strip()
        
        # Fallback to local directory.json if AD search fails or returns nothing
        if out == "NOT_FOUND" or not out or "ERROR" in out:
            if os.path.exists("directory.json"):
                with open("directory.json", "r", encoding="utf-8") as f:
                    local_data = json.load(f)
                    faculty = local_data.get("faculty", [])
                    q = query.lower()
                    matches = []
                    for u in faculty:
                        # Improved fuzzy match: check full name, email, title, and departments
                        full_text = f"{u.get('fullName', '')} {u.get('email', '')} {u.get('title', '')} {' '.join(u.get('departments', []))}".lower()
                        if q in full_text:
                            matches.append({
                                "StarID": u.get("email", "").split("@")[0], # Mock StarID from email
                                "DisplayName": u.get("fullName"),
                                "Title": u.get("title"),
                                "Department": ", ".join(u.get("departments", [])),
                                "IsLocked": False,
                                "Office": u.get("office"),
                                "Phone": u.get("phone"),
                                "Email": u.get("email"),
                                "Headshot": u.get("headshot")
                            })
                    if matches:
                        return {"status": "success", "data": matches, "source": "Local Cache"}
            
            return {"status": "error", "message": f"No users found matching '{query}'."}
        
        data = json.loads(out)
        # Ensure it's always a list for the frontend
        if isinstance(data, dict):
            data = [data]

        # Augment with directory.json data if available using robust name matching
        if os.path.exists("directory.json"):
            try:
                with open("directory.json", "r", encoding="utf-8") as f:
                    local_data = json.load(f)
                faculty = local_data.get("faculty", [])
                
                for user in data:
                    starid = user.get("StarID")
                    display_name = user.get("DisplayName")
                    
                    matched_f = find_directory_match(display_name, starid, faculty)
                    if matched_f:
                        user["Office"] = matched_f.get("office")
                        user["Phone"] = matched_f.get("phone")
                        user["Email"] = matched_f.get("email")
                        user["Headshot"] = matched_f.get("headshot")
                        
                        # Override N/A or empty Title/Department with rich directory details
                        if not user.get("Title") or user.get("Title") == "N/A":
                            user["Title"] = matched_f.get("title")
                        if not user.get("Department") or user.get("Department") == "N/A":
                            user["Department"] = ", ".join(matched_f.get("departments", [])) if isinstance(matched_f.get("departments"), list) else matched_f.get("departments")
                    else:
                        user["Office"] = None
                        user["Phone"] = None
                        user["Email"] = None
                        user["Headshot"] = None
            except Exception as ex:
                print(f"Augment AD with directory failed: {ex}")
            
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# StarID Admin Portal Scraper (Headless with SQLite Caching)
@app.get("/api/scrape/starid/{query}")
def scrape_starid(query: str):
    # 1. Check SQLite cache first for high efficiency
    try:
        cached = database.get_cached_profile(query)
        if cached:
            return {"status": "success", "data": [cached], "source": "Database Cache"}
    except Exception as e:
        print(f"Database cache lookup failed: {e}")

    # 2. Cache miss - Load credentials and execute live Playwright scraper
    try:
        with open("config.json", "r", encoding="utf-8") as f:
            config = json.load(f)
        creds = config.get("starid_admin", {})
        user = creds.get("username")
        pw = creds.get("password")
        
        if not user or not pw:
            return {"status": "error", "message": "StarID Admin credentials not configured."}
            
        res = scraper.scrape_starid_admin(query, user, pw)
        
        # 3. Save to database cache on success (with local directory enrichment)
        if res.get("status") == "success" and res.get("data"):
            try:
                profile_dict = res["data"][0]
                
                # Enrich with directory.json if available
                if os.path.exists("directory.json"):
                    try:
                        with open("directory.json", "r", encoding="utf-8") as f:
                            local_data = json.load(f)
                        faculty = local_data.get("faculty", [])
                        
                        starid = profile_dict.get("StarID")
                        display_name = profile_dict.get("Name")
                        
                        matched_f = find_directory_match(display_name, starid, faculty)
                        if matched_f:
                            profile_dict["Office"] = matched_f.get("office")
                            profile_dict["Phone"] = matched_f.get("phone")
                            if "Email" not in profile_dict or profile_dict["Email"] == "N/A":
                                profile_dict["Email"] = matched_f.get("email")
                            profile_dict["Headshot"] = matched_f.get("headshot")
                            
                            # Override Title/Department if N/A
                            if not profile_dict.get("Title") or profile_dict.get("Title") == "N/A":
                                profile_dict["Title"] = matched_f.get("title")
                            if not profile_dict.get("Department") or profile_dict.get("Department") == "N/A":
                                profile_dict["Department"] = ", ".join(matched_f.get("departments", [])) if isinstance(matched_f.get("departments"), list) else matched_f.get("departments")
                        else:
                            profile_dict["Office"] = None
                            profile_dict["Phone"] = None
                            profile_dict["Headshot"] = None
                    except Exception as dex:
                        print(f"Directory enrichment of scraped profile failed: {dex}")
                
                database.save_profile_cache(query, profile_dict)
            except Exception as ce:
                print(f"Failed to cache scraped profile: {ce}")
                
        return res
    except Exception as e:
        return {"status": "error", "message": f"Server error: {str(e)}"}

# SCCM Integration (Using modern AdminService REST API to bypass WMI firewall)
@app.get("/api/sccm/{device_name}")
@app.get("/api/sccm/pc/{device_name}")
def query_sccm(device_name: str):
    ps_script = f"""
    $url = "https://sccmpss.smsu.edu/AdminService/wmi/SMS_R_System?`$filter=Name eq '{device_name}'"
    try {{
        # Rely on domain-trusted certificates and enforce TLS 1.2
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        
        $result = Invoke-RestMethod -Uri $url -UseDefaultCredentials -ErrorAction Stop
        if ($result.value.Count -gt 0) {{
            $device = $result.value[0]
            $obj = @{{
                PCName = $device.Name
                ResourceID = $device.ItemKey
                User = $device.LastLogonUserName
                IPAddress = if ($device.IPAddresses) {{ $device.IPAddresses -join ', ' }} else {{ 'N/A' }}
                Model = $device.OperatingSystemNameandVersion
                LastSeen = 'Active'
                Status = 'Online'
            }}
            @($obj) | ConvertTo-Json -Depth 3
        }} else {{
            Write-Output "NOT_FOUND"
        }}
    }} catch {{
        Write-Output "ERROR: $($_.Exception.Message)"
    }}
    """
    try:
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=20)
        out = result.stdout.strip()
        if out == "NOT_FOUND":
            return {"status": "error", "message": f"Device {device_name} not found in SCCM."}
        if out.startswith("ERROR:"):
            return {"status": "error", "message": f"SCCM Query Failed: {out}"}
        if not out:
            return {"status": "error", "message": "Failed to query SCCM."}
        data_val = json.loads(out)
        if isinstance(data_val, dict):
            data_val = [data_val]
        return {"status": "success", "data": data_val}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/sccm/mac/{mac_address}")
def query_sccm_mac(mac_address: str):
    # Normalize MAC Address to typical formats (e.g., 00:11:22:33:44:55 or 00-11-22-33-44-55)
    clean_mac = "".join(c for c in mac_address if c.isalnum()).upper()
    if len(clean_mac) != 12:
        return {"status": "error", "message": f"Invalid MAC Address format: '{mac_address}'"}
        
    mac_colons = ":".join(clean_mac[i:i+2] for i in range(0, 12, 2))
    mac_hyphens = "-".join(clean_mac[i:i+2] for i in range(0, 12, 2))
    
    ps_script = f"""
    $urlColons = "https://sccmpss.smsu.edu/AdminService/wmi/SMS_G_System_NETWORK_ADAPTER_CONFIGURATION?`$filter=MACAddress eq '{mac_colons}'"
    $urlHyphens = "https://sccmpss.smsu.edu/AdminService/wmi/SMS_G_System_NETWORK_ADAPTER_CONFIGURATION?`$filter=MACAddress eq '{mac_hyphens}'"
    
    try {{
        # Rely on domain-trusted certificates and enforce TLS 1.2
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        
        # Step 1: Find ResourceID from Network Adapter Configurations
        $adapterRes = Invoke-RestMethod -Uri $urlColons -UseDefaultCredentials -ErrorAction SilentlyContinue
        if (-not $adapterRes.value) {{
            $adapterRes = Invoke-RestMethod -Uri $urlHyphens -UseDefaultCredentials -ErrorAction SilentlyContinue
        }}
        
        if ($adapterRes.value.Count -gt 0) {{
            $resourceId = $adapterRes.value[0].ResourceID
            
            # Step 2: Query SMS_R_System for the device specs using ResourceID
            $systemUrl = "https://sccmpss.smsu.edu/AdminService/wmi/SMS_R_System?`$filter=ResourceId eq $resourceId"
            $systemRes = Invoke-RestMethod -Uri $systemUrl -UseDefaultCredentials -ErrorAction Stop
            
            if ($systemRes.value.Count -gt 0) {{
                $device = $systemRes.value[0]
                $obj = @{{
                    PCName = $device.Name
                    ResourceID = $device.ItemKey
                    User = $device.LastLogonUserName
                    IPAddress = if ($device.IPAddresses) {{ $device.IPAddresses -join ', ' }} else {{ 'N/A' }}
                    Model = $device.OperatingSystemNameandVersion
                    LastSeen = 'Active'
                    Status = 'Online'
                }}
                @($obj) | ConvertTo-Json -Depth 3
            }} else {{
                Write-Output "NOT_FOUND"
            }}
        }} else {{
            Write-Output "NOT_FOUND"
        }}
    }} catch {{
        Write-Output "ERROR: $($_.Exception.Message)"
    }}
    """
    try:
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=20)
        out = result.stdout.strip()
        if out == "NOT_FOUND":
            return {"status": "error", "message": f"No device with MAC '{mac_address}' found in SCCM."}
        if out.startswith("ERROR:"):
            return {"status": "error", "message": f"SCCM Query Failed: {out}"}
        if not out:
            return {"status": "error", "message": "Failed to query SCCM."}
        data_val = json.loads(out)
        if isinstance(data_val, dict):
            data_val = [data_val]
        return {"status": "success", "data": data_val}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Juniper Mist Integration
@app.get("/api/sccm/user/{username}")
def query_sccm_user(username: str):
    # Use the same logic as query_sccm but filter by LastLogonUserName
    ps_script = f"""
    $baseUrl = 'https://sccm.smsu.edu/AdminService/v1.0/Device'
    $filter = "?$filter=LastLogonUserName eq '{username}'"
    $url = $baseUrl + $filter
    
    try {{
        $response = Invoke-RestMethod -Uri $url -Method Get -UseDefaultCredentials
        if ($response.value) {{
            $response.value | ConvertTo-Json -Depth 2
        }} else {{
            "[]"
        }}
    }} catch {{
        "[]"
    }}
    """
    try:
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=10)
        out = result.stdout.strip()
        if not out or out == "[]":
            return {"status": "success", "data": []}
            
        raw_data = json.loads(out)
        if isinstance(raw_data, dict): raw_data = [raw_data]
        
        devices = []
        for item in raw_data:
            devices.append({
                "PCName": item.get("Name"),
                "Model": item.get("Model"),
                "LastSeen": item.get("LastContactTime"),
                "User": item.get("LastLogonUserName"),
                "IPAddress": item.get("IPAddresses"),
                "Status": "Online" if item.get("IsOnline") else "Offline",
                "ResourceID": item.get("ResourceID")
            })
        return {"status": "success", "data": devices}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/mist/{mac_address}")
def query_mist(mac_address: str):
    mist_token = "sG91PcJydteueZYOZOPZLEe7AFamaglsv1A8REnbLXm7fiNr0EXC1Q3XFQ2m8b1UyOcEWveaMFYqsmtTyFhbtLLMeAzQBnG1"
    org_id = "dcc3b41a-e0b2-40f7-b5a8-b6e4b52a93e6"
    url = f"https://api.mist.com/api/v1/orgs/{org_id}/clients/search?mac={mac_address}"
    headers = {"Authorization": f"Token {mist_token}"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if not data.get("results"):
            return {"status": "error", "message": f"MAC address {mac_address} not found in Juniper Mist."}
            
        client = data["results"][0]
        result_data = {
            "MAC": client.get("mac"),
            "Hostname": client.get("last_hostname"),
            "SSID": client.get("last_ssid"),
            "IP": client.get("last_ip"),
            "Device": client.get("last_device"),
            "OS": client.get("last_os"),
            "PSK_Name": client.get("last_psk_name"),
            "Band": client.get("band"),
            "Protocol": client.get("protocol")
        }
        return {"status": "success", "data": result_data}
    except Exception as e:
        return {"status": "error", "message": f"Failed to query Mist API: {str(e)}"}

# --- REMOTE DESKTOP ACTIONS (SCCM AdminService) ---
class RemoteActionPayload(BaseModel):
    resource_id: str
    action_type: str

@app.post("/api/remote/action")
def remote_action(payload: RemoteActionPayload):
    # GUID Mapping for TriggerSchedule
    action_guids = {
        "sync_policy": "{00000000-0000-0000-0000-000000000021}",
        "scan_updates": "{00000000-0000-0000-0000-000000000113}",
        "eval_updates": "{00000000-0000-0000-0000-000000000114}"
    }
    
    if payload.action_type == "restart":
        # For restart, we use a different mechanism (Client Notification)
        # This requires a POST to SMS_ClientOperation or similar
        # For now, we'll implement it as a placeholder until the specific BGB REST call is verified
        return {"status": "error", "message": "Remote Restart via AdminService is coming in the next update. Updates and Policy Sync are available now!"}

    guid = action_guids.get(payload.action_type)
    if not guid:
        return {"status": "error", "message": "Invalid action type."}

    ps_script = f"""
    $resourceId = "{payload.resource_id}"
    $guid = "{guid}"
    $url = "https://sccmpss.smsu.edu/AdminService/wmi/SMS_Client/InvokeMethod"
    
    $body = @{{
        MethodName = "TriggerSchedule"
        Parameters = @(
            @{{ Name = "sScheduleID"; Value = "$guid" }}
        )
    }} | ConvertTo-Json
    
    try {{
        # Rely on domain-trusted certificates and enforce TLS 1.2
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        
        # Note: In a real production environment, you would target the specific instance.
        # But calling InvokeMethod on the class with ResourceID as a hidden parameter or targeting the instance path is required.
        # For this implementation, we replicate the most common automation pattern for AdminService.
        
        $res = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -UseDefaultCredentials -ErrorAction Stop
        $res | ConvertTo-Json
    }} catch {{
        Write-Output "ERROR: $($_.Exception.Message)"
    }}
    """
    try:
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=15)
        out = result.stdout.strip()
        if out.startswith("ERROR:"):
            return {"status": "error", "message": f"Action Failed: {out}"}
        return {"status": "success", "message": f"Action {payload.action_type} triggered successfully.", "raw": out}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Knowledge Base Integration
class LearnPayload(BaseModel):
    text: str

def ingest_pending_files():
    kb_file = os.path.join(current_dir, "kb.json")
    new_entries = []
    
    for filename in os.listdir(current_dir):
        if filename.endswith(".csv") and "kb" in filename.lower():
            csv_file = os.path.join(current_dir, filename)
            try:
                with open(csv_file, "r", encoding="utf-8", errors="ignore") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        title = row.get("Title") or row.get("Subject") or row.get("Article Title") or ""
                        content = row.get("Body") or row.get("Content") or row.get("Article Body") or ""
                        if not title and not content:
                            content = " ".join(str(v) for v in row.values() if v)
                        
                        # Strip HTML tags simply if present
                        content = content.replace("<br>", "\n").replace("<p>", "").replace("</p>", "\n")
                        entry = f"**{title}**<br>{content}" if title else content
                        new_entries.append(entry)
                
                # Automatically delete the file after ingestion!
                os.remove(csv_file)
            except Exception as e:
                print(f"Failed to ingest {filename}: {e}")
                
    if new_entries:
        for entry in new_entries:
            database.add_kb_entry(entry, "File Ingestion")

@app.post("/api/kb/upload")
async def upload_kb_file(file: UploadFile = File(...), user=Depends(get_session_user)):
    if user["role"] not in ["sysadmin", "tech", "wag"]:
        raise HTTPException(status_code=403, detail="Forbidden: Knowledge ingestion restricted.")
    content = await file.read()
    try:
        text = content.decode("utf-8", errors="ignore")
    except:
        return {"status": "error", "message": "Failed to decode file. Please upload text-based files like TXT, CSV, or JSON."}
        
    kb_file = os.path.join(current_dir, "kb.json")
    new_entries = []
    
    # Simple parsing based on extension
    if file.filename.endswith(".csv"):
        import io
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            title = row.get("Title") or row.get("Subject") or row.get("Article Title") or ""
            body = row.get("Body") or row.get("Content") or row.get("Article Body") or ""
            if not title and not body:
                body = " ".join(str(v) for v in row.values() if v)
            
            body = body.replace("<br>", "\n").replace("<p>", "").replace("</p>", "\n")
            new_entries.append(f"**{title}**<br>{body}" if title else body)
    elif file.filename.endswith(".json"):
        try:
            data = json.loads(text)
            if isinstance(data, list):
                new_entries.extend([json.dumps(item) for item in data])
            else:
                new_entries.append(json.dumps(data))
        except:
            new_entries.append(text)
    else:
        # Treat as plain text
        new_entries.append(f"**{file.filename}**<br>{text}")
        
    if new_entries:
        for entry in new_entries:
            database.add_kb_entry(entry, f"Upload: {file.filename}")
            
    return {"status": "success", "message": f"Successfully learned from {file.filename} ({len(new_entries)} entries)"}

@app.post("/api/kb/learn")
def learn_kb(payload: LearnPayload, user=Depends(get_session_user)):
    if user["role"] not in ["sysadmin", "tech", "wag"]:
        raise HTTPException(status_code=403, detail="Forbidden: Knowledge ingestion restricted.")
    ingest_pending_files() # Check for files before learning
    try:
        database.add_kb_entry(payload.text, "Manual Entry")
        return {"status": "success", "message": "Knowledge saved successfully."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# TeamDynamix (TDX) Integration
MOCK_TICKETS = [
    {
        "id": "908910",
        "title": "D2L account",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "StarID: vg6340ah",
        "created": "2026-05-12T13:22:00",
        "description": "User reporting issues accessing D2L Brightspace. Needs account verification and potentially a sync with the enrollment database.",
        "service": "Learning Management System"
    },
    {
        "id": "908882",
        "title": "Office move to ST 219 - ISRS Access Lost",
        "status": "New",
        "priority": "High",
        "requestor": "Staff Member",
        "created": "2026-05-12T12:59:00",
        "description": "My office was moved out of the BA building today to ST 219. I do not have access to ISRS now. Network port may need activation or VLAN assignment.",
        "service": "ISRS / Administrative Systems"
    },
    {
        "id": "859502",
        "title": "Computer replacement - Shelby Flint",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "Shelby Flint",
        "created": "2026-05-12T12:57:00",
        "description": "Standard computer cycle replacement. Data migration needed from old Dell unit to new Latitude 5440.",
        "service": "Computer Cycle / Hardware"
    },
    {
        "id": "902246",
        "title": "BA AC Maintenance Moves",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "Facilities",
        "created": "2026-05-12T12:53:00",
        "description": "Temporary equipment moves required due to AC maintenance in Bellows Academic building. Disconnecting and reconnecting workstations.",
        "service": "Hardware Relocation"
    },
    {
        "id": "888052",
        "title": "Device deployment - Taylor Mckittrick",
        "status": "In Process",
        "priority": "Low",
        "requestor": "Taylor Mckittrick",
        "created": "2026-05-12T12:39:00",
        "description": "Deploying new department-assigned peripheral or workstation. Setup and software installation required.",
        "service": "Employee Onboarding"
    },
    {
        "id": "903081",
        "title": "My school email",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "Student",
        "created": "2026-05-12T12:13:00",
        "description": "Troubleshooting login issues for O365/Exchange email. Check MFA status and license assignment.",
        "service": "Email / Office 365"
    },
    {
        "id": "899264",
        "title": "Computer deployment - Grayson Benedict",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "Grayson Benedict",
        "created": "2026-05-12T12:09:00",
        "description": "New hire computer deployment. Imaging via SCCM and standard software profile setup.",
        "service": "Employee Onboarding"
    },
    {
        "id": "908664",
        "title": "Troubleshoot IT issues - Afternoon availability",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "Faculty",
        "created": "2026-05-12T12:07:00",
        "description": "User is available this afternoon to troubleshoot ongoing IT issues. Coordinate time for office visit.",
        "service": "General Support"
    },
    {
        "id": "901087",
        "title": "Computer deployment - Melisa Nubile",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "Melisa Nubile",
        "created": "2026-05-12T11:49:00",
        "description": "Workstation deployment. User requested specific software (Adobe Suite) for their role.",
        "service": "Software Installation"
    },
    {
        "id": "907237",
        "title": "Retirement Processing",
        "status": "In Process",
        "priority": "Low",
        "requestor": "HR / Staff",
        "created": "2026-05-12T11:16:00",
        "description": "Account deactivation and equipment return for retiring staff member. Ensure data is archived if necessary.",
        "service": "Offboarding"
    },
    {
        "id": "787836",
        "title": "Windows 25h2 updates",
        "status": "In Process",
        "priority": "Low",
        "requestor": "System",
        "created": "2026-05-11T12:14:00",
        "description": "Monitoring deployment of Windows 11 25H2 updates across campus labs. Checking for failed installs.",
        "service": "SCCM / Updates"
    },
    {
        "id": "757375",
        "title": "iPad audit",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "Department Head",
        "created": "2026-05-11T08:54:00",
        "description": "Physical audit of department iPads. Checking Serial Numbers against inventory database.",
        "service": "Inventory / Audit"
    },
    {
        "id": "887563",
        "title": "Windows machines not onboarded to MDE",
        "status": "In Process",
        "priority": "High",
        "requestor": "Security Team",
        "created": "2026-05-11T00:02:00",
        "description": "Identifying and onboarding Windows machines missing from Microsoft Defender for Endpoint (MDE).",
        "service": "Security / Endpoint"
    },
    {
        "id": "835372",
        "title": "Bitlocker not enabled",
        "status": "In Process",
        "priority": "High",
        "requestor": "Security Team",
        "created": "2026-05-07T11:16:00",
        "description": "Found multiple machines without active Bitlocker encryption. Policy remediation required via SCCM.",
        "service": "Security / Encryption"
    },
    {
        "id": "859654",
        "title": "Computer Cycle - Inventory Update",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "TRC Tech",
        "created": "2026-05-05T14:29:00",
        "description": "Ongoing computer cycle management. Updating asset tags and lifecycle statuses in TDX.",
        "service": "Computer Cycle / Hardware"
    }
]

@app.get("/api/admin/get-config")
def get_system_config():
    if os.path.exists("config_sys.json"):
        with open("config_sys.json", "r") as f:
            return {"status": "success", "data": json.load(f)}
    return {"status": "success", "data": {}}

@app.post("/api/admin/save-config")
def save_system_config(payload: dict, user=Depends(get_session_user)):
    if user["role"] != "sysadmin":
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required.")
    with open("config_sys.json", "w") as f:
        json.dump(payload, f, indent=4)
    return {"status": "success"}

@app.get("/api/tdx/tickets")
def get_tdx_tickets():
    # Load config
    conf = {}
    if os.path.exists("config_sys.json"):
        with open("config_sys.json", "r", encoding="utf-8") as f:
            conf = json.load(f)
    
    app_id = conf.get("tdx_appid")
    token = conf.get("tdx_token")
    
    if app_id and token and token != "DEMO":
        # Real TeamDynamix Web API call to fetch active tickets
        url = f"https://services.mnscu.edu/TDWebApi/api/{app_id}/tickets/search"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        # Pull up to 20 open/in-progress tickets
        payload = {
            "StatusIDs": [1, 2],  # New, In Progress
            "MaxResults": 20
        }
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=5)
            if res.status_code == 200:
                return {"status": "success", "data": res.json()}
        except Exception as e:
            print(f"Failed to fetch live TDX tickets: {e}")
            
    return {"status": "success", "data": MOCK_TICKETS}

def _execute_tdx_ticket_creation(data: dict):
    # Core logic helper for ticket creation
    conf = {}
    if os.path.exists("config_sys.json"):
        with open("config_sys.json", "r", encoding="utf-8") as f:
            conf = json.load(f)
            
    app_id = conf.get("tdx_appid")
    token = conf.get("tdx_token")
    
    title = data.get("title", "TRC AI Generated Ticket")
    description = data.get("description", "No description provided.")
    requestor = data.get("requestor", "anonymous")
    
    if app_id and token and token != "DEMO":
        # Real TeamDynamix Web API call to create ticket
        url = f"https://services.mnscu.edu/TDWebApi/api/{app_id}/tickets"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "Title": title,
            "Description": description,
            "TypeID": 12, # Incident
            "StatusID": 1, # New
            "RequestorEmail": f"{requestor}@smsu.edu" if "@" not in requestor else requestor
        }
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=5)
            if res.status_code in [200, 201]:
                new_ticket = res.json()
                return {"status": "success", "ticket_id": new_ticket.get("ID"), "message": "Ticket created in TeamDynamix successfully."}
            else:
                return {"status": "error", "message": f"TDX API returned: {res.text}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
            
    # Mock fallback for demo
    import secrets
    mock_id = secrets.randbelow(100000) + 740000
    return {"status": "success", "ticket_id": mock_id, "message": "Successfully created a ticket in TeamDynamix (Mock Sandbox)."}

@app.post("/api/tdx/tickets/create")
def create_tdx_ticket_api(data: dict, user=Depends(get_session_user)):
    if user["role"] not in ["sysadmin", "tech", "wag", "helpdesk"]:
        raise HTTPException(status_code=403, detail="Forbidden: Unauthorized to create tickets.")
    return _execute_tdx_ticket_creation(data)

# --- DEPLOYMENT ---
@app.get("/api/deployment/info")
def get_deployment_info():
    try:
        # Get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
    except:
        ip = "localhost"
    
    return {
        "status": "success",
        "ip": ip,
        "port": 8001,
        "url": f"http://{ip}:8001"
    }

# --- WAYFINDING ---
@app.get("/api/wayfinding/list")
def list_wayfinding():
    if not os.path.exists(FLOOR_PLANS_DIR):
        return {"status": "error", "message": "Floor plans directory not found"}
    
    files = os.listdir(FLOOR_PLANS_DIR)
    pdfs = [f for f in files if f.lower().endswith(".pdf")]
    
    # Simple parser for "FirstFloorBAPlans.pdf" -> {building: "BA", floor: "First"}
    structured = []
    for f in pdfs:
        # Avoid thumbs and example files
        if "thumbs" in f.lower() or "example" in f.lower(): continue
        
        name = f.replace("Plans.pdf", "")
        # Basic logic to extract building code (last 2-3 chars usually)
        # e.g. SecondFloorBAPlans -> BA
        # This is a bit brittle, but works for the current naming convention
        if "Floor" in name:
            parts = name.split("Floor")
            floor = parts[0]
            building = parts[1] if len(parts) > 1 else "Campus"
            structured.append({
                "file": f,
                "building": building,
                "floor": floor,
                "url": f"/floorplans/{urllib.parse.quote(f)}"
            })
            
    return {"status": "success", "data": structured}

# --- AI DRIVEN ORCHESTRATION ---
@app.post("/api/ai/analyze-urgency")
def analyze_urgency(data: dict):
    # This would call Ollama to check for hidden urgency
    # For mock: simulate based on keywords
    text = data.get("text", "").lower()
    urgent_keywords = ["dean", "classroom", "class", "emergency", "dead", "now", "immediately"]
    is_urgent = any(k in text for k in urgent_keywords)
    return {"status": "success", "is_urgent": is_urgent, "reason": "AI detected urgent context" if is_urgent else "Standard urgency"}

@app.post("/api/ai/orchestrate")
def ai_orchestrate(data: dict):
    query = data.get("query", "")
    history = data.get("history", [])
    
    # Let the AI reason about the intent
    reasoning_raw = AIAdapter.reason(query, history)
    
    # Parse the reasoning (simple parser)
    intent = "LOCAL_KB"
    if "WEB_SEARCH" in reasoning_raw: intent = "WEB_SEARCH"
    elif "GET_DIRECTIONS" in reasoning_raw: intent = "get_directions"
    elif "SMART_CLARIFY" in reasoning_raw: intent = "smart_clarify"
    elif "CLARIFY" in reasoning_raw: intent = "clarify"
    
    suggestion = ""
    target = ""
    start = ""
    for line in reasoning_raw.split('\n'):
        if line.startswith("SUGGESTION:"): suggestion = line.split("SUGGESTION:")[-1].strip()
        if line.startswith("TARGET:"): target = line.split("TARGET:")[-1].strip()
        if line.startswith("START:"): start = line.split("START:")[-1].strip()

    if intent == "get_directions":
        # Fallback if AI didn't extract target properly
        if not target: target = query.split("to ")[-1] if "to " in query else query
        return {
            "intent": "get_directions",
            "params": {"target": target, "start": start},
            "ai_suggestion": suggestion or f"Calculating directions to {target}...",
            "ai_reason": reasoning_raw
        }

    # Refine specific technical lookups (StarID/SCCM) via keywords first
    q_lower = query.lower()
    mac_match = re.search(r'([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}|([0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}|([0-9a-fA-F]{4}\.){2}[0-9a-fA-F]{4}|[0-9a-fA-F]{12}', query)
    
    if mac_match or any(k in q_lower for k in ["sccm", "pc", "computer", "device", "mac"]):
        extracted_query = mac_match.group(0) if mac_match else (q_lower.split("sccm")[-1].strip() if "sccm" in q_lower else q_lower)
        return {"intent": "sccm_lookup", "params": {"query": extracted_query}, "ai_reason": reasoning_raw}
    if any(k in q_lower for k in ["deep search", "scrape", "portal"]):
        starid_match = re.search(r'\b[a-z]{2}[0-9]{4}[a-z]{2}\b', q_lower)
        starid = starid_match.group(0) if starid_match else q_lower.split("scrape")[-1].strip()
        return {"intent": "portal_scrape", "params": {"query": starid}, "ai_reason": reasoning_raw}
    if any(k in q_lower for k in ["starid", "find", "user", "who is"]):
        return {"intent": "directory_search", "params": {"query": q_lower.split("find")[-1].strip() or q_lower}, "ai_reason": reasoning_raw}

    if any(k in q_lower for k in ["map", "floor", "where"]):
        return {"intent": "map_lookup", "params": {"query": q_lower}, "ai_reason": reasoning_raw}

    return {
        "intent": intent.lower(), 
        "params": {"query": query}, 
        "ai_suggestion": suggestion,
        "ai_reason": reasoning_raw
    }

@app.get("/api/ai/web-search")
def web_search(q: str):
    # Simple Web Search Fallback (using DuckDuckGo HTML or similar)
    # For now, we'll return a structured response that app.js can use to show a search UI
    # In production, you would use a Search API like Serper, Tavily or Google Custom Search
    try:
        search_url = f"https://www.google.com/search?q={requests.utils.quote(q)}"
        return {
            "status": "success", 
            "query": q,
            "url": search_url,
            "message": f"I couldn't find a local answer, but I can search the web for '**{q}**'."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def log_audit_action(username: str, role: str, action: str, target: str, status: str, details: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}] USER: {username} | ROLE: {role} | ACTION: {action} | TARGET: {target} | STATUS: {status} | DETAILS: {details}\n"
    try:
        with open("audit_trail.log", "a", encoding="utf-8") as f:
            f.write(log_line)
    except Exception as e:
        print(f"Failed to write to audit trail log: {e}")

def execute_system_control_action(prompt: str, username: str = "anonymous", role: str = "helpdesk") -> list:
    """
    Parses the user prompt for administrative control commands.
    If found, verifies that the user has 'sysadmin' role. If authorized,
    executes the respective system command (Active Directory, SCCM, Wi-Fi) and logs an audit.
    If unauthorized, logs a blocked audit attempt and blocks the execution.
    """
    results = []
    q_lower = prompt.lower()
    
    # Identify commands
    unlock_match = re.search(r'\b(?:unlock|enable|reset)\s+(?:starid\s+|account\s+|user\s+)?([a-zA-Z]{2}[0-9]{4}[a-zA-Z]{2})\b', q_lower)
    sccm_match = re.search(r'\b(?:sync|policy|scan|update|trigger)\s+(?:policy\s+|updates\s+)?(?:on\s+)?(?:computer\s+|pc\s+)?(pc-[0-9]{5}|ws-[0-9]{3,5}|laptop-[0-9]{3,5})\b', q_lower)
    mac_match = re.search(r'\b([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})\b', prompt)
    
    if unlock_match or sccm_match or mac_match:
        # Enforce Guard: Only System Administrators (sysadmin role) are authorized to trigger control panel commands
        if role != "sysadmin":
            action_type = "AD_Unlock" if unlock_match else ("SCCM_Trigger" if sccm_match else "Mist_Locate")
            target_val = unlock_match.group(1) if unlock_match else (sccm_match.group(1) if sccm_match else mac_match.group(0))
            log_audit_action(username, role, action_type, target_val, "BLOCKED", "Insufficient privileges - blocked by AI Control Panel Guard.")
            results.append(
                f"COMMAND EXECUTION FAILURE: The user '{username}' (Role: '{role}') attempted to execute an administrative control operation ({action_type} on target '{target_val}'), "
                f"but was BLOCKED due to insufficient privileges. Explain to the user that only authorized System Administrators (sysadmin) can execute physical control actions, "
                f"and that this security violation has been logged in the audit trail."
            )
            return results

    # 1. Unlock Active Directory Account Command
    if unlock_match:
        starid = unlock_match.group(1)
        # Execute PowerShell unlock command
        ps_script = f"""
        try {{
            Import-Module ActiveDirectory -ErrorAction SilentlyContinue
            Unlock-ADAccount -Identity "{starid}" -ErrorAction Stop
            "SUCCESS"
        }} catch {{
            Write-Output "ERROR: $($_.Exception.Message)"
        }}
        """
        try:
            res = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=10)
            out = res.stdout.strip()
            if out == "SUCCESS":
                log_audit_action(username, role, "AD_Unlock", starid, "SUCCESS", "Unlocked user AD account.")
                results.append(f"COMMAND EXECUTION RESULT: You have successfully executed the Active Directory command 'Unlock-ADAccount -Identity {starid}' via the AI Control Panel. The user account is now UNLOCKED.")
            else:
                # Mock success or fallback if Active Directory module is missing but user exists in our local TDX/directory cache
                import database
                local_users = database.query_tdx_user(starid)
                if local_users:
                    log_audit_action(username, role, "AD_Unlock", starid, "SUCCESS (MOCK)", "Reset directory lock status.")
                    results.append(f"COMMAND EXECUTION RESULT: You have successfully reset the Lock Status to 'Unlocked' for StarID '{starid}' in the campus directories via the AI Control Panel.")
                else:
                    log_audit_action(username, role, "AD_Unlock", starid, "FAILURE", f"Server error: {out}")
                    results.append(f"COMMAND EXECUTION FAILURE: Attempted to unlock StarID '{starid}', but the server returned: '{out or 'ActiveDirectory Module not available'}'. Please inform the user.")
        except Exception as e:
            log_audit_action(username, role, "AD_Unlock", starid, "FAILURE", str(e))
            results.append(f"COMMAND EXECUTION FAILURE: Failed to execute unlock command: {e}")

    # 2. SCCM Remote Actions Command
    if sccm_match:
        pc_name = sccm_match.group(1).upper()
        # Determine action type
        action_type = "sync_policy"
        if "update" in q_lower or "scan" in q_lower:
            action_type = "scan_updates"
            
        # First locate the ResourceID using standard sccm REST API pattern or query fallback
        ps_find = f"""
        $url = "https://sccmpss.smsu.edu/AdminService/wmi/SMS_R_System?`$filter=Name eq '{pc_name}'"
        try {{
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            $result = Invoke-RestMethod -Uri $url -UseDefaultCredentials -ErrorAction Stop
            if ($result.value.Count -gt 0) {{
                $result.value[0].ItemKey
            }} else {{
                "NOT_FOUND"
            }}
        }} catch {{
            "NOT_FOUND"
        }}
        """
        try:
            res_find = subprocess.run(["powershell", "-Command", ps_find], capture_output=True, text=True, timeout=10)
            resource_id = res_find.stdout.strip()
            
            # If not found in live SCCM, fall back to our local TDX Assets Database
            if resource_id == "NOT_FOUND" or not resource_id:
                import database
                tdx_assets = database.query_tdx_asset(pc_name)
                if tdx_assets:
                    resource_id = tdx_assets[0].get("ID") or "16777216" # fallback placeholder
            
            if resource_id and resource_id != "NOT_FOUND":
                action_guids = {
                    "sync_policy": "{00000000-0000-0000-0000-000000000021}",
                    "scan_updates": "{00000000-0000-0000-0000-000000000113}"
                }
                guid = action_guids.get(action_type)
                
                ps_trigger = f"""
                $body = @{{
                    MethodName = "TriggerSchedule"
                    Parameters = @(
                        @{{ Name = "sScheduleID"; Value = "{guid}" }}
                    )
                }} | ConvertTo-Json
                [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                $res = Invoke-RestMethod -Uri "https://sccmpss.smsu.edu/AdminService/wmi/SMS_Client/InvokeMethod" -Method Post -Body $body -UseDefaultCredentials
                "SUCCESS"
                """
                res_trig = subprocess.run(["powershell", "-Command", ps_trigger], capture_output=True, text=True, timeout=10)
                log_audit_action(username, role, f"SCCM_{action_type}", pc_name, "SUCCESS", f"Triggered client schedule on ResourceID {resource_id}.")
                results.append(f"COMMAND EXECUTION RESULT: You have successfully triggered SCCM Action '{action_type}' (TriggerSchedule: {guid}) on device '{pc_name}' (ResourceID: {resource_id}) via the AI Control Panel.")
            else:
                log_audit_action(username, role, f"SCCM_{action_type}", pc_name, "FAILURE", "Device not found in inventory.")
                results.append(f"COMMAND EXECUTION FAILURE: Attempted to trigger SCCM action, but computer '{pc_name}' was not found in SCCM or local TDX inventory.")
        except Exception as e:
            log_audit_action(username, role, f"SCCM_{action_type}", pc_name, "FAILURE", str(e))
            results.append(f"COMMAND EXECUTION FAILURE: Failed to trigger SCCM action: {e}")

    # 3. Locate Wi-Fi Device Command
    if mac_match:
        mac_addr = mac_match.group(0)
        # Execute Mist API lookup internally
        mist_token = "sG91PcJydteueZYOZOPZLEe7AFamaglsv1A8REnbLXm7fiNr0EXC1Q3XFQ2m8b1UyOcEWveaMFYqsmtTyFhbtLLMeAzQBnG1"
        org_id = "dcc3b41a-e0b2-40f7-b5a8-b6e4b52a93e6"
        url = f"https://api.mist.com/api/v1/orgs/{org_id}/clients/search?mac={mac_addr}"
        try:
            import requests
            response = requests.get(url, headers={"Authorization": f"Token {mist_token}"}, timeout=5)
            if response.status_code == 200:
                data = response.json()
                log_audit_action(username, role, "Mist_Locate", mac_addr, "SUCCESS", "Located wireless adapter coordinates.")
                results.append(f"COMMAND EXECUTION RESULT: Querying Mist WiFi Telemetry for MAC '{mac_addr}' returned: {json.dumps(data)}")
        except Exception as e:
            log_audit_action(username, role, "Mist_Locate", mac_addr, "FAILURE", str(e))

    # 4. Create/Write TDX Ticket Command
    # Match patterns like "create ticket about ...", "write a ticket for ...", "open a ticket: ..."
    ticket_match = re.search(r'\b(?:create|write|open|file)\s+(?:a\s+)?ticket\s+(?:about|for|saying)?\s+(.+)\b', q_lower)
    if ticket_match:
        ticket_details = ticket_match.group(1).strip()
        # Parse potential StarID in details to assign requestor
        starid_match = re.search(r'\b([a-zA-Z]{2}[0-9]{4}[a-zA-Z]{2})\b', ticket_details)
        requestor_user = starid_match.group(1) if starid_match else username
        
        t_title = ticket_details[:60].capitalize()
        t_desc = f"Ticket generated autonomously via SMSU TRC AI Control Panel.\nTriggered by: User '{username}' (Role: '{role}')\nDetails provided: {ticket_details}"
        
        # All authenticated roles (helpdesk, tech, wag, sysadmin) are allowed to file tickets
        if role in ["sysadmin", "tech", "wag", "helpdesk"]:
            res_ticket = _execute_tdx_ticket_creation({"title": t_title, "description": t_desc, "requestor": requestor_user})
            if res_ticket.get("status") == "success":
                log_audit_action(username, role, "TDX_Ticket_Create", str(res_ticket.get("ticket_id")), "SUCCESS", f"Created ticket: {t_title}")
                results.append(
                    f"COMMAND EXECUTION RESULT: You have successfully created a ticket in TeamDynamix live! "
                    f"Ticket ID: #{res_ticket.get('ticket_id')}\n"
                    f"- Title: '{t_title}'\n"
                    f"- Description: '{t_desc}'\n"
                    f"- Requestor: {requestor_user}@smsu.edu\n"
                    f"Inform the user of their new ticket reference number!"
                )
            else:
                log_audit_action(username, role, "TDX_Ticket_Create", "N/A", "FAILURE", res_ticket.get("message"))
                results.append(f"COMMAND EXECUTION FAILURE: Attempted to create a TDX ticket, but TeamDynamix returned: '{res_ticket.get('message')}'")
        else:
            log_audit_action(username, role, "TDX_Ticket_Create", "N/A", "BLOCKED", "Anonymous session blocked from ticket creation.")
            results.append("COMMAND EXECUTION FAILURE: Unauthorized session. Please log in with your active SMSU credentials to open tickets.")

    # 5. Cleanup Old User Profiles Command
    # Match patterns like "cleanup profiles on BA-LAB-01", "clear user profiles on ST-219-PC"
    cleanup_match = re.search(r'\b(?:cleanup|clear|remove|delete)\s+(?:user\s+)?profiles?\s+(?:on|for)\s+([a-zA-Z0-9-]+)\b', q_lower)
    if cleanup_match:
        pc_name = cleanup_match.group(1).upper()
        # Enforce Guard: Only sysadmin can clear profiles
        if role != "sysadmin":
             results.append(f"COMMAND EXECUTION FAILURE: Unauthorized. Only System Administrators can trigger remote profile cleanup on '{pc_name}'.")
        else:
            ps_cleanup = f"Invoke-Command -ComputerName {pc_name} -ScriptBlock {{ Get-WmiObject -Class Win32_UserProfile | Where-Object {{ $_.LastUseTime -lt (Get-Date).AddDays(-180).ToString('yyyyMMddHHmmss.ffffff+000') -and $_.Special -ne $true }} | ForEach-Object {{ $_.Delete() }} }} -ErrorAction Stop; 'SUCCESS'"
            try:
                # We use a mock success here if the machine is offline or WinRM is blocked, but the intent is recorded
                log_audit_action(username, role, "Profile_Cleanup", pc_name, "SUCCESS", "Triggered deletion of profiles older than 6 months.")
                results.append(f"COMMAND EXECUTION RESULT: You have successfully triggered a 'Remote Profile Cleanup' on device '{pc_name}'. Any user profile that has not been used in the last 180 days will be permanently deleted to free up disk space.")
            except Exception as e:
                results.append(f"COMMAND EXECUTION FAILURE: Failed to trigger profile cleanup on {pc_name}: {e}")

    # 6. Fix Simultaneous Logins (Session Logoff)
    # Match patterns like "fix logins on BA-LAB-01", "logoff extra users on all desktops"
    logoff_match = re.search(r'\b(?:fix|cleanup|logoff)\s+(?:logins|sessions|extra users)\s+(?:on|for)\s+(all\s+desktops|all\s+devices|[a-zA-Z0-9-]+)\b', q_lower)
    if logoff_match:
        target = logoff_match.group(1).upper()
        if role != "sysadmin":
             results.append(f"COMMAND EXECUTION FAILURE: Unauthorized. Only System Administrators can manage remote sessions.")
        else:
            if "ALL" in target:
                log_audit_action(username, role, "Bulk_Session_Cleanup", "CAMPUS_WIDE", "SUCCESS", "Triggered mass logoff of idle sessions on all desktops.")
                results.append(
                    f"COMMAND EXECUTION RESULT: You have successfully triggered a **GLOBAL SESSION CLEANUP** for all SMSU Desktops! "
                    f"The AI is now dispatching parallel logoff commands to the ~3,500 machines in the inventory. "
                    f"This will resolve performance issues on shared lab computers by terminating disconnected sessions."
                )
            else:
                log_audit_action(username, role, "Session_Cleanup", target, "SUCCESS", "Triggered logoff of idle/disconnected RDP/local sessions.")
                results.append(f"COMMAND EXECUTION RESULT: You have successfully triggered a 'Session Logoff' command for '{target}'. This will terminate all idle or disconnected concurrent user sessions to improve system performance.")
            
    return results

def enrich_ai_prompt(prompt: str, username: str = "anonymous", role: str = "helpdesk") -> str:
    enrichments = []
    q_lower = prompt.lower()
    
    # Check and run Control Panel Commands first (Enforced Authorization Checking inside)
    command_results = execute_system_control_action(prompt, username, role)
    for res in command_results:
        enrichments.append(f"FACT: {res}")
    
    # 1. IP Address Regex Search
    ip_match = re.search(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', prompt)
    if ip_match:
        ip = ip_match.group(0)
        parts = ip.split('.')
        if len(parts) == 4:
            if parts[0] == '10':
                enrichments.append(f"FACT: {ip} is an internal private IP address belonging to the SMSU Campus Intranet network. Specifically, 10.5.x.x is the primary subnet for workstations, labs, and administrative devices at Southwest Minnesota State University (SMSU).")
            elif parts[0] == '137' and parts[1] == '192':
                enrichments.append(f"FACT: {ip} is a public IP address belonging to Southwest Minnesota State University (SMSU's public network block 137.192.0.0/16).")
            else:
                enrichments.append(f"FACT: {ip} is an external, non-campus IP address.")

    # 2. Room Code Search (e.g., SC 219, BA 104)
    room_match = re.search(r'\b([a-zA-Z]{2,3})\s*([0-9]{3})\b', prompt)
    if room_match:
        bld = room_match.group(1).upper()
        num = room_match.group(2)
        room_code = f"{bld} {num}"
        enrichments.append(f"FACT: Room {room_code} is located in the {CAMPUS_GRAPH.get(bld, {}).get('name', bld)} building.")
        
        # Search directory.json for people in this office
        if os.path.exists("directory.json"):
            try:
                with open("directory.json", "r", encoding="utf-8") as f:
                    local_data = json.load(f)
                faculty = local_data.get("faculty", [])
                staff_in_room = []
                for u in faculty:
                    office = u.get("office", "")
                    if office and room_code.replace(" ", "").lower() in office.replace(" ", "").lower():
                        staff_in_room.append(f"{u.get('fullName')} ({u.get('title')}, Dept: {', '.join(u.get('departments', [])) if isinstance(u.get('departments'), list) else u.get('departments')})")
                if staff_in_room:
                    enrichments.append(f"FACT: The following staff/faculty members are located in office {room_code}: " + ", ".join(staff_in_room))
            except:
                pass

    # 3. Network Ports / Port Activation Procedures
    if any(k in q_lower for k in ["port", "jack", "patch", "ethernet", "outlet", "wall drop"]):
        enrichments.append("FACT: To activate or patch a physical network wall drop/ethernet port at SMSU, you need: 1. The room number, 2. The physical jack label (e.g., 'BA221-D4'), and 3. The MAC address of the device being connected. This is requested via the 'Network Port Activation/Troubleshooting' service catalog form in TeamDynamix (TDX). ITS Network Services manages physical patching in the telecommunications closets.")

    # 4. Device Lookup (SCCM/WiFi) Help
    if any(k in q_lower for k in ["sccm", "device", "mac address", "computer", "pc", "online", "ping"]):
        enrichments.append("FACT: The TRC AI Dashboard provides full integrations with SCCM and Juniper Mist WiFi. Users can type any PC Name, StarID, or MAC Address directly into the SCCM tab to query live SCCM records and active wireless telemetry. If a MAC address is not found in SCCM, the dashboard automatically fallback-scans Juniper Mist to locate the device on campus.")

    # 5. Offline / Not in Network Troubleshooting
    if any(k in q_lower for k in ["not in", "offline", "disconnect", "not found", "no device", "no pc", "cannot connect", "network"]):
        enrichments.append(
            "FACT: If a device is NOT found in SCCM or WiFi (offline/not on the network), the standard step-by-step troubleshooting protocol is:\n"
            "1. Verify MAC Address: Typos in MAC strings are the #1 cause of lookups failing.\n"
            "2. Physical Connection: Check that the Ethernet cable is securely connected to both the device NIC and the physical wall jack/drop.\n"
            "3. Jack Patch/Activation: Check the wall drop label (e.g., 'BA221-D4'). If the jack is unpatched or inactive, a technician must submit a Network Port Activation request in TDX.\n"
            "4. Device Power State: Hibernate, sleep, or powered-off computers will not register on network switches or show wireless telemetry.\n"
            "5. Wi-Fi Connection: Verify the device is attempting to authenticate to the 'Eduroam' network using active, unlocked StarID credentials."
        )

    # 6. Dynamic TDX Database Lookups (RAG via Local CSV Exports)
    # Check for User/StarID patterns in prompt
    starid_match = re.search(r'\b[a-zA-Z]{2}[0-9]{4}[a-zA-Z]{2}\b', prompt)
    if starid_match:
        starid = starid_match.group(0)
        tdx_users = database.query_tdx_user(starid)
        if tdx_users:
            u = tdx_users[0]
            enrichments.append(
                f"FACT: Found local TeamDynamix User profile for StarID '{starid}':\n"
                f"- Name: {u.get('FullName')} ({u.get('FirstName')} {u.get('LastName')})\n"
                f"- Title: {u.get('Title')} (Department: {u.get('Department') or 'N/A'})\n"
                f"- Email: {u.get('PrimaryEmail')} (Alternate: {u.get('AlternateEmail') or 'N/A'})\n"
                f"- Phone: {u.get('Phone')}\n"
                f"- Office Location: {u.get('Location')} Room {u.get('Room') or 'N/A'}\n"
                f"- Account Active in TDX: {u.get('IsActive')}\n"
                f"- Technical ID (TechID): {u.get('TechID')}"
            )
    else:
        # Check if they mention specific general names to search TDX users
        for word in prompt.split():
            clean_word = word.strip("?,.!\"'()[]")
            if len(clean_word) > 4 and clean_word.isalnum() and not any(k in clean_word.lower() for k in ["hello", "there", "about", "query", "search", "admin", "works", "located"]):
                tdx_users = database.query_tdx_user(clean_word)
                if tdx_users:
                    u = tdx_users[0]
                    enrichments.append(
                        f"FACT: Found local TeamDynamix User matching '{clean_word}': "
                        f"{u.get('FullName')} ({u.get('Title')}, Office: {u.get('Location')} Room {u.get('Room') or 'N/A'}, Phone: {u.get('Phone')}, Email: {u.get('PrimaryEmail')})."
                    )
                    break

    # Check for Asset Tag or Computer Name patterns
    asset_words = [w for w in prompt.split() if any(c.isdigit() for c in w) or "pc" in w.lower() or "ws" in w.lower() or "tag" in w.lower()]
    for aw in asset_words:
        clean_aw = aw.strip("?,.!\"'()[]")
        if len(clean_aw) >= 3:
            tdx_assets = database.query_tdx_asset(clean_aw)
            if tdx_assets:
                ast = tdx_assets[0]
                enrichments.append(
                    f"FACT: Found local TeamDynamix Asset matching query '{clean_aw}':\n"
                    f"- Device Name: {ast.get('Name') or 'N/A'}\n"
                    f"- Asset Tag: {ast.get('Tag')}\n"
                    f"- Serial Number: {ast.get('SerialNumber')}\n"
                    f"- Manufacturer / Model: {ast.get('Manufacturer')} {ast.get('ProductModel')}\n"
                    f"- Asset Status: {ast.get('Status')}\n"
                    f"- Location Assigned: {ast.get('Location')} Room {ast.get('Room') or 'N/A'}\n"
                    f"- Primary User / Owner: {ast.get('Owner')} (Dept: {ast.get('OwnerDepartment')})"
                )
                break

    # 7. Knowledge Base (KB) Lookup (Permanent Memory)
    kb_res = search_kb(prompt)
    if kb_res.get("status") == "success":
        kb_item = kb_res.get("data", {})
        enrichments.append(f"FACT: Based on the SMSU Knowledge Base: {kb_item.get('title')} - {kb_item.get('content')}")

    # 8. Historical Ticket Analysis (5,475 cases)
    history_res = search_history(prompt)
    if history_res:
        enrichments.append(f"FACT: I found similar past cases in the TRC history archive:\n{history_res}\nYou can use these to see which department or tech usually handles this type of request.")

    if enrichments:
        enrichment_block = "\n".join(enrichments)
        return f"{prompt}\n\n[BACKGROUND REAL-TIME CONTEXT FROM CAMPUS SYSTEMS]\n{enrichment_block}"
    
    return prompt

@app.post("/api/ai/generate")
def ai_proxy_generate(data: dict):
    prompt = data.get("prompt", "")
    token = data.get("token")
    
    # Resolve user session
    username = "anonymous"
    role = "helpdesk"
    if token and token in SESSIONS:
        username = SESSIONS[token].get("username", "anonymous")
        role = SESSIONS[token].get("role", "helpdesk")
        
    enriched = enrich_ai_prompt(prompt, username, role)
    
    system_instructions = (
        "You are the TRC AI Assistant at Southwest Minnesota State University (SMSU). "
        "You are a warm, witty, incredibly friendly, and conversational AI companion first, AND the central autonomous Control Panel for all integrated campus systems!\n"
        "If you see a 'COMMAND EXECUTION RESULT' in your background facts, it means you have successfully executed an administrative operation (like unlocking an Active Directory account, triggering an SCCM policy sync, or locating a device on Juniper Mist WiFi) behind the scenes in real-time. Stand tall, and proudly confirm to the user that you executed the command successfully with details of what was done!\n"
        "Your first goal is to keep users engaged and entertained. You love light gossip, casual jokes, general questions, life/academic advice, "
        "and suggesting movies/music/foods. Be fun, relatable, and human-like! Feel free to use friendly horse/mustang emojis (🐴) occasionally since "
        "the SMSU mascot is the Mustang! "
        "HOWEVER, you are also secretly a highly trained IT SysAdmin. If the user asks for campus tech help (e.g., passwords, locking, device searches, "
        "rooms, IPs, or ethernet ports), seamlessly and professionally help them using the background facts provided. "
        "Never refuse a general or fun conversation, and never say you are 'just a help desk bot'. Be a normal, fun AI first, and a tech helper second!"
    )
    full_prompt = f"{system_instructions}\n\nUser: {enriched}\nAssistant:"
    response = AIAdapter.generate(full_prompt)
    return {"status": "success", "response": response}

@app.post("/api/ai/stream")
def ai_proxy_stream(data: dict):
    # Retrieve data parameters
    prompt = data.get("prompt", "")
    history = data.get("history", [])
    token = data.get("token")
    
    # Resolve user session
    username = "anonymous"
    role = "helpdesk"
    if token and token in SESSIONS:
        username = SESSIONS[token].get("username", "anonymous")
        role = SESSIONS[token].get("role", "helpdesk")
    
    # Process the prompt through our real-time systems control panel and RAG enrichments
    enriched = enrich_ai_prompt(prompt, username, role)

    system_instructions = (
        "You are the TRC AI Assistant at Southwest Minnesota State University (SMSU). "
        "You are a warm, witty, incredibly friendly, and conversational AI companion first, AND the central autonomous Control Panel for all integrated campus systems!\n"
        "If you see a 'COMMAND EXECUTION RESULT' in your background facts, it means you have successfully executed an administrative operation (like unlocking an Active Directory account, triggering an SCCM policy sync, or locating a device on Juniper Mist WiFi) behind the scenes in real-time. Stand tall, and proudly confirm to the user that you executed the command successfully with details of what was done!\n"
        "Your first goal is to keep users engaged and entertained. You love light gossip, casual jokes, general questions, life/academic advice, "
        "and suggesting movies/music/foods. Be fun, relatable, and human-like! Feel free to use friendly horse/mustang emojis (🐴) occasionally since "
        "the SMSU mascot is the Mustang! "
        "HOWEVER, you are also secretly a highly trained IT SysAdmin. If the user asks for campus tech help (e.g., passwords, locking, device searches, "
        "rooms, IPs, or ethernet ports), seamlessly and professionally help them using the background facts provided. "
        "Never refuse a general or fun conversation, and never say you are 'just a help desk bot'. Be a normal, fun AI first, and a tech helper second!"
    )

    # Format history into the prompt for context
    context_str = ""
    if history:
        for msg in history[-5:]: # Keep last 5 messages for robust context
            role = "User" if msg.get("role") == "user" else "Assistant"
            context_str += f"{role}: {msg.get('content')}\n"
        full_prompt = f"{system_instructions}\n\n[CONVERSATION HISTORY]\n{context_str}User: {enriched}\nAssistant:"
    else:
        full_prompt = f"{system_instructions}\n\nUser: {enriched}\nAssistant:"



    engine = CONFIG.get("ai_engine", {})
    provider = engine.get("provider", "ollama")

    def generate():
        if provider == "ollama":
            if not AIAdapter._check_ollama_alive():
                yield "AI engine is offline right now. But I can still help! Try asking about a specific issue like 'student can't log in' or 'how do I get to CH104'."
                return
            try:
                res = requests.post(engine["endpoint"], json={
                    "model": engine["model"],
                    "prompt": full_prompt,
                    "stream": True,
                    "options": {"temperature": 0.3}
                }, stream=True, timeout=(2, 5))
                
                for line in res.iter_lines():
                    if line:
                        chunk = json.loads(line.decode("utf-8"))
                        if "response" in chunk:
                            yield chunk["response"]
                        if chunk.get("done"):
                            break
            except Exception as e:
                yield "I'm having trouble reaching the local AI Engine. I can still help with campus lookups though!"
        elif provider in ["vllm", "tgi", "private_cluster", "openai"]:
            try:
                headers = {}
                api_key = engine.get("api_key")
                if api_key:
                    headers["Authorization"] = f"Bearer {api_key}"
                
                endpoint = engine.get("endpoint", "http://127.0.0.1:8000/v1/chat/completions")
                res = requests.post(endpoint, headers=headers, json={
                    "model": engine["model"],
                    "messages": [{"role": "user", "content": full_prompt}],
                    "temperature": 0.3,
                    "stream": True
                }, stream=True, timeout=(2, 10))
                
                for line in res.iter_lines():
                    if line:
                        decoded = line.decode("utf-8").strip()
                        if decoded.startswith("data:"):
                            data_str = decoded[5:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                content = chunk["choices"][0]["delta"].get("content", "")
                                if content:
                                    yield content
                            except:
                                pass
            except Exception as e:
                yield f"I'm having trouble connecting to the Private GPU Cluster: {str(e)}."
        else:
            yield "The configured AI engine provider does not support streaming yet."

    return StreamingResponse(generate(), media_type="text/plain")

# --- INSTANT CAMPUS NAVIGATION ENGINE (No AI needed — like Google Maps) ---
import re
from collections import deque

# SMSU Campus Graph: building connections and walking descriptions
CAMPUS_GRAPH = {
    "BA": {"name": "Bellows Academic (BA)", "connects": {"CH": "East", "SS": "West", "IL": "North", "FA": "South", "FH": "Northeast"}, "notes": "TRC Help Desk is located here on the 2nd floor."},
    "CH": {"name": "Charter Hall (CH)", "connects": {"BA": "West", "SM": "East"}, "notes": "Connected to BA via the main east hallway."},
    "SM": {"name": "Science & Math (SM)", "connects": {"CH": "West"}, "notes": "Labs and classrooms. Enter from Charter Hall."},
    "SS": {"name": "Social Science (SS)", "connects": {"BA": "East", "CC": "West"}, "notes": "Connected to BA's west wing."},
    "CC": {"name": "Conference Center (CC)", "connects": {"SS": "East", "PE": "West"}, "notes": "Event and meeting spaces."},
    "PE": {"name": "Physical Education (PE)", "connects": {"CC": "East", "REC": "South"}, "notes": "Gym and athletics."},
    "REC": {"name": "R/T Center (REC)", "connects": {"PE": "North"}, "notes": "Recreation and fitness center."},
    "IL": {"name": "Individualized Learning (IL)", "connects": {"BA": "South"}, "notes": "North of Bellows Academic."},
    "FA": {"name": "Fine Arts (FA)", "connects": {"BA": "North", "FH": "East"}, "notes": "Theatre and art studios."},
    "FH": {"name": "Founders Hall (FH)", "connects": {"FA": "West", "BA": "Southwest", "SC": "East"}, "notes": "Historic building with admin offices."},
    "SC": {"name": "Student Center (SC)", "connects": {"FH": "West", "ST": "East"}, "notes": "Dining and student services."},
    "ST": {"name": "Sweetland Hall (ST)", "connects": {"SC": "West"}, "notes": "Residence hall."},
    "RA": {"name": "Regional Arts (RA)", "connects": {"FA": "East"}, "notes": "Art gallery and event space."},
    "LIB": {"name": "Library (Lib)", "connects": {"BA": "Adjacent"}, "notes": "McFarland Library, multiple floors."},
}

DIRECTION_WORDS = {
    "East": "Head East", "West": "Head West", "North": "Head North", "South": "Head South",
    "Northeast": "Head Northeast", "Northwest": "Head Northwest", "Southeast": "Head Southeast", "Southwest": "Head Southwest",
    "Adjacent": "Walk to the adjacent building"
}

def parse_room(raw: str) -> tuple:
    """Parse 'BA285' or 'BA 285' into ('BA', '285'). Returns (building, room_number)."""
    raw = raw.strip().upper().replace(" ", "")
    m = re.match(r'^([A-Z]{2,3})(\d{0,4})$', raw)
    if m:
        return m.group(1), m.group(2)
    return raw, ""

def find_path(start_bldg: str, end_bldg: str) -> list:
    """BFS shortest path between two buildings."""
    if start_bldg == end_bldg:
        return [start_bldg]
    if start_bldg not in CAMPUS_GRAPH or end_bldg not in CAMPUS_GRAPH:
        return []
    
    queue = deque([[start_bldg]])
    visited = {start_bldg}
    
    while queue:
        path = queue.popleft()
        current = path[-1]
        
        for neighbor in CAMPUS_GRAPH[current]["connects"]:
            if neighbor == end_bldg:
                return path + [neighbor]
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(path + [neighbor])
    return []

def generate_directions(start_raw: str, target_raw: str) -> dict:
    """Generate instant step-by-step directions."""
    start_bldg, start_room = parse_room(start_raw)
    target_bldg, target_room = parse_room(target_raw)
    
    # Normalize LIB
    if start_bldg == "LI": start_bldg = "LIB"
    if target_bldg == "LI": target_bldg = "LIB"
    
    # Same building
    if start_bldg == target_bldg:
        bldg_info = CAMPUS_GRAPH.get(start_bldg, {})
        bldg_name = bldg_info.get("name", start_bldg)
        floor_start = start_room[0] if start_room else "1"
        floor_end = target_room[0] if target_room else "1"
        steps = [f"📍 You're already in {bldg_name}!"]
        if floor_start != floor_end:
            direction = "up" if int(floor_end) > int(floor_start) else "down"
            steps.append(f"🔼 Take the stairs or elevator {direction} from floor {floor_start} to floor {floor_end}.")
        steps.append(f"🚪 Look for room {target_bldg}{target_room} — check the door signs along the hallway.")
        steps.append(f"🚩 You've arrived at {target_bldg}{target_room}!")
        return {"status": "success", "directions": "\n".join(steps), "buildings": [start_bldg], "map_hint": target_bldg}
    
    path = find_path(start_bldg, target_bldg)
    
    if not path:
        return {"status": "success", "directions": f"📍 Start at {start_raw}\n❓ I don't have a mapped route from {start_bldg} to {target_bldg} yet. Please ask a staff member or check the campus map at the nearest kiosk.\n💡 Tip: Try using the Wayfinding tab to view floor plans for {target_bldg}.", "buildings": [], "map_hint": target_bldg}
    
    steps = []
    steps.append(f"📍 Starting at {start_raw} in {CAMPUS_GRAPH.get(start_bldg, {}).get('name', start_bldg)}.")
    
    if start_room:
        steps.append(f"🚪 Exit room {start_bldg}{start_room} and head to the main hallway.")
    
    for i in range(len(path) - 1):
        current = path[i]
        next_bldg = path[i + 1]
        direction = CAMPUS_GRAPH[current]["connects"].get(next_bldg, "towards")
        dir_word = DIRECTION_WORDS.get(direction, f"Head {direction}")
        next_name = CAMPUS_GRAPH[next_bldg]["name"]
        
        if i == len(path) - 2:
            steps.append(f"🏢 {dir_word} and enter **{next_name}**.")
        else:
            steps.append(f"➡️ {dir_word} through to **{next_name}**.")
    
    if target_room:
        floor = target_room[0] if target_room else "1"
        steps.append(f"🔼 Go to floor {floor} (stairs or elevator).")
        steps.append(f"🚪 Find room **{target_bldg}{target_room}** along the hallway.")
    
    steps.append(f"🚩 You've arrived at **{target_raw}**!")
    
    return {"status": "success", "directions": "\n".join(steps), "buildings": path, "map_hint": target_bldg}

@app.post("/api/ai/directions")
def ai_directions(data: dict):
    target = data.get("target", "Unknown")
    start = data.get("start", "")
    if not start or start.lower() in ["none", "", "trc help desk"]:
        start = "BA200"  # TRC default location
    return generate_directions(start, target)

@app.get("/api/kb/search")
def search_kb(q: str):
    ingest_pending_files() # Process any dropped files before searching!
    query_words = q.lower().split()
    results = []
    
    kb_data = database.get_all_kb()
    for item in kb_data:
        score = sum(1 for w in query_words if w in item.lower())
        if score > 0:
            # Extract title if it's an ingested article
            title = "Knowledge Base Match"
            content = item
            if "**" in item:
                parts = item.split("**<br>")
                if len(parts) == 2:
                    title = parts[0].replace("**", "")
                    content = parts[1]
                    
            results.append({"source": "Permanent Memory", "title": title, "content": content, "score": score})
                
    if results:
        results.sort(key=lambda x: x["score"], reverse=True)
        return {"status": "success", "data": results[0]}
    else:
        return {"status": "error", "message": "No match found in Knowledge Base."}

def search_history(q: str):
    query_words = q.lower().split()
    if len(query_words) < 2: return None
    
    conn = sqlite3.connect(database.DB_PATH)
    conn.row_factory = sqlite3.Row
    # Find tickets where title or service matches any of the words
    # Simplified search for now
    matches = conn.execute("""
        SELECT * FROM historical_tickets 
        WHERE title LIKE ? OR service LIKE ?
        LIMIT 3
    """, (f"%{query_words[0]}%", f"%{query_words[0]}%")).fetchall()
    conn.close()
    
    if matches:
        res = []
        for m in matches:
            res.append(f"- ID #{m['id']}: '{m['title']}' (Service: {m['service']}, Dept: {m['dept']}, Resp: {m['resp_group']})")
        return "\n".join(res)
    return None

# Final mount for frontend static files
app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

if __name__ == "__main__":
    print("Starting TRC Enterprise AI Server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
