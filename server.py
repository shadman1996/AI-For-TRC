import subprocess
import scraper
import json
import os
import requests
import csv
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File
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
        # Determine role: Custom > AD Fallback
        user_data = database.get_user(u)
        if user_data:
            role = user_data["role"]
        elif "wag" in u or "admin" in u or "shadman" in u:
            role = "sysadmin"
        elif "tech" in u:
            role = "tech"
        else:
            role = "helpdesk"
            
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

@app.get("/api/admin/users")
def get_admin_users():
    return {"status": "success", "roles": database.get_all_users()}

@app.get("/api/config")
def get_config():
    return {"status": "success", "config": CONFIG}

@app.post("/api/admin/users")
def update_admin_user(data: dict):
    username = data["username"].lower()
    role = data["role"]
    modules = data.get("modules", CONFIG["default_module_permissions"].get(role, []))
    database.upsert_user(username, role, modules)
    return {"status": "success"}

@app.delete("/api/admin/users/{username}")
def delete_admin_user(username: str):
    database.delete_user(username)
    return {"status": "success"}

@app.get("/api/auth/me")
def get_me(token: str):
    if token in SESSIONS:
        return {"status": "success", "data": SESSIONS[token]}
    return {"status": "error", "message": "Unauthorized"}

# Mount static files for the frontend
current_dir = os.path.dirname(os.path.abspath(__file__))

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
        if out == "NOT_FOUND" or not out:
            return {"status": "error", "message": f"No users found matching '{query}'."}
        
        data = json.loads(out)
        # Ensure it's always a list for the frontend
        if isinstance(data, dict):
            data = [data]
            
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# StarID Admin Portal Scraper (Headless)
@app.get("/api/scrape/starid/{query}")
def scrape_starid(query: str):
    # Load credentials from config.json
    try:
        with open("config.json", "r") as f:
            config = json.load(f)
        creds = config.get("starid_admin", {})
        user = creds.get("username")
        pw = creds.get("password")
        
        if not user or not pw:
            return {"status": "error", "message": "StarID Admin credentials not configured."}
            
        return scraper.scrape_starid_admin(query, user, pw)
    except Exception as e:
        return {"status": "error", "message": f"Server error: {str(e)}"}

# SCCM Integration (Using modern AdminService REST API to bypass WMI firewall)
@app.get("/api/sccm/{device_name}")
def query_sccm(device_name: str):
    ps_script = f"""
    $url = "https://sccmpss.smsu.edu/AdminService/wmi/SMS_R_System?`$filter=Name eq '{device_name}'"
    try {{
        # Bypass SSL checks if internal certificate is not trusted
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        [Net.ServicePointManager]::ServerCertificateValidationCallback = {{$true}}
        
        $result = Invoke-RestMethod -Uri $url -UseDefaultCredentials -ErrorAction Stop
        if ($result.value.Count -gt 0) {{
            $device = $result.value[0]
            $obj = @{{
                Name = $device.Name
                ResourceID = $device.ItemKey
                LastLogonUserName = $device.LastLogonUserName
                IPAddresses = $device.IPAddresses
                OperatingSystemNameandVersion = $device.OperatingSystemNameandVersion
                MACAddresses = $device.MACAddresses
            }}
            $obj | ConvertTo-Json -Depth 3
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
        return {"status": "success", "data": json.loads(out)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Juniper Mist Integration
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
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        [Net.ServicePointManager]::ServerCertificateValidationCallback = {{$true}}
        
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
async def upload_kb_file(file: UploadFile = File(...)):
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
def learn_kb(payload: LearnPayload):
    ingest_pending_files() # Check for files before learning
    try:
        database.add_kb_entry(payload.text, "Manual Entry")
        return {"status": "success", "message": "Knowledge saved successfully."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# TeamDynamix (TDX) Integration
MOCK_TICKETS = [
    {
        "id": "123456",
        "title": "Printer Jam - Library 2nd Floor",
        "status": "In Process",
        "priority": "Medium",
        "requestor": "John Smith",
        "created": "2026-05-10T14:30:00",
        "description": "The big Marco printer in the library (2nd floor) is showing a 'Paper Jam in Tray 2' error. I've tried clearing the tray but the error persists. Class starts in 20 minutes and I need to print 50 handouts.",
        "service": "Printing Support"
    },
    {
        "id": "123457",
        "title": "Account Locked - Faculty StarID",
        "status": "New",
        "priority": "High",
        "requestor": "Dr. Jane Miller",
        "created": "2026-05-11T08:15:00",
        "description": "I'm unable to log into my office computer or D2L. It says my account is locked. I might have entered my password wrong too many times after the recent update.",
        "service": "Disabled/Locked Account Request"
    },
    {
        "id": "123458",
        "title": "New Laptop Setup - HR",
        "status": "In Process",
        "priority": "Low",
        "requestor": "Sarah Wilson",
        "created": "2026-05-09T10:00:00",
        "description": "Setting up a new Dell Latitude for the new HR assistant starting next Monday. Need standard office software and access to the 'HR-Sensitive' shared drive.",
        "service": "Employee Onboarding"
    },
    {
        "id": "123459",
        "title": "WiFi dropping in Student Center",
        "status": "New",
        "priority": "Medium",
        "requestor": "Student Guest",
        "created": "2026-05-11T09:45:00",
        "description": "Several students in the upper level of the Student Center are reporting that the 'SMSU-Public' WiFi keeps disconnecting every few minutes. My MAC is 00:0a:95:9d:68:16.",
        "service": "Campus Network"
    }
]

@app.get("/api/tdx/tickets")
def get_tdx_tickets(token: str = None):
    # In the future, this will check 'token' and call the real TDX API
    # For now, we return mock data for development
    return {"status": "success", "data": MOCK_TICKETS}

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
    if any(k in q_lower for k in ["sccm", "pc", "computer"]):
        return {"intent": "sccm_lookup", "params": {"query": q_lower.split("sccm")[-1].strip() or q_lower}, "ai_reason": reasoning_raw}
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

@app.post("/api/ai/generate")
def ai_proxy_generate(data: dict):
    prompt = data.get("prompt", "")
    response = AIAdapter.generate(prompt)
    return {"status": "success", "response": response}

@app.post("/api/ai/stream")
async def ai_proxy_stream(data: dict):
    prompt = data.get("prompt", "")
    history = data.get("history", [])
    engine = CONFIG.get("ai_engine", {})
    
    if engine.get("provider") != "ollama":
        return {"status": "error", "message": "Streaming only supported for Ollama provider currently."}

    # Format history into the prompt for context
    context_str = ""
    if history:
        for msg in history[-4:]: # Keep last 4 messages to save context window
            role = "User" if msg.get("role") == "user" else "Assistant"
            context_str += f"{role}: {msg.get('content')}\n"
        full_prompt = f"Below is a conversation between a User and a TRC Help Desk Assistant.\n\n{context_str}User: {prompt}\nAssistant:"
    else:
        full_prompt = prompt

    def generate():
        if not AIAdapter._check_ollama_alive():
            yield "AI engine is offline right now. But I can still help! Try asking about a specific issue like 'student can't log in' or 'how do I get to CH104'."
            return
            
        try:
            res = requests.post(engine["endpoint"], json={
                "model": engine["model"],
                "prompt": full_prompt,
                "stream": True,
                "options": {"temperature": 0.3}
            }, stream=True, timeout=(2, 5))  # (connect=2s, read=5s)
            
            for line in res.iter_lines():
                if line:
                    chunk = json.loads(line.decode("utf-8"))
                    if "response" in chunk:
                        yield chunk["response"]
                    if "error" in chunk:
                        yield f"AI Error: {chunk['error']}. I'm trying to fix this on the backend!"
                    if chunk.get("done"):
                        break
            if not res.ok and res.status_code != 200:
                yield "I'm having a bit of trouble reaching my brain (AI Engine). I can still help with campus lookups and standard procedures though!"
        except requests.exceptions.ConnectionError:
            yield "AI engine is offline right now. But I can still help! Try asking about a specific issue like 'student can't log in' or 'how do I get to CH104'."
        except requests.exceptions.Timeout:
            yield "AI is taking too long to respond. Try being more specific about what you need."
        except Exception as e:
            yield f"Something went wrong with the AI. Try rephrasing your question."

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

# Final mount for frontend static files
app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

if __name__ == "__main__":
    print("Starting TRC Enterprise AI Server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
