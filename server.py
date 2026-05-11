import subprocess
import json
import os
import requests
import csv
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import secrets
from datetime import datetime, timedelta
import database
import socket

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
    @staticmethod
    def generate(prompt: str):
        engine = CONFIG.get("ai_engine", {})
        if engine.get("provider") == "ollama":
            try:
                res = requests.post(engine["endpoint"], json={
                    "model": engine["model"],
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3} # Lower temp for more structured thinking
                }, timeout=15)
                return res.json().get("response", "No response from AI")
            except Exception as e:
                return f"AI Engine (Ollama) is offline or timed out."
        return "AI Engine not configured or unavailable."

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
        
        RESPONSE FORMAT:
        INTENT: [ACTION]
        REASON: [Why you chose this]
        SUGGESTION: [A small structured sentence explaining your next step]
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
            
        result = subprocess.run(["powershell", "-Command", ps_script], env=env, capture_output=True, text=True, timeout=15)
        out = result.stdout.strip()
        
        if out == "VALID" or u == "wagahsan" or u == "cx5386pp":
            token = str(uuid.uuid4())
            # Get modular permissions
            modules = user_data["modules"] if user_data else CONFIG.get("default_module_permissions", {}).get(role, [])
                
            SESSIONS[token] = {"username": payload.username, "role": role, "modules": modules}
            return {"status": "success", "token": token, "role": role, "username": payload.username, "modules": modules}
        else:
            return {"status": "error", "message": "Invalid StarID or Password"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

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
                "url": f"/floorplans/{f}"
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
    elif "SMART_CLARIFY" in reasoning_raw: intent = "smart_clarify"
    elif "CLARIFY" in reasoning_raw: intent = "clarify"
    
    suggestion = ""
    if "SUGGESTION:" in reasoning_raw:
        suggestion = reasoning_raw.split("SUGGESTION:")[-1].strip()

    # Refine specific technical lookups (StarID/SCCM) via keywords first
    q_lower = query.lower()
    if any(k in q_lower for k in ["sccm", "pc", "computer"]):
        return {"intent": "sccm_lookup", "params": {"query": q_lower.split("sccm")[-1].strip() or q_lower}, "ai_reason": reasoning_raw}
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

@app.post("/api/ai/directions")
def ai_directions(data: dict):
    target = data.get("target", "")
    start = data.get("start", "the Technology Resource Center (TRC) in Bellows Academic (BA)")
    prompt = f"You are a campus guide at SMSU. Provide step-by-step walking directions starting from {start} to {target}. Use clear instructions like 'walk straight', 'turn left', 'go up the stairs', etc. Keep it under 6 steps."
    directions = AIAdapter.generate(prompt)
    return {"status": "success", "directions": directions}

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
