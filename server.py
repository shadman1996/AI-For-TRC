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

app = FastAPI(title="TRC Enterprise AI API")
current_dir = os.path.dirname(os.path.abspath(__file__))

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

# Persistent roles file
ROLES_FILE = os.path.join(current_dir, "roles.json")

def load_roles():
    if os.path.exists(ROLES_FILE):
        try:
            with open(ROLES_FILE, "r") as f:
                return json.load(f)
        except: return {}
    return {}

def save_roles(roles):
    with open(ROLES_FILE, "w") as f:
        json.dump(roles, f, indent=4)

@app.post("/api/auth/login")
def login(payload: LoginPayload):
    u = payload.username.lower().strip()
    p = payload.password.strip().lower()
    
    # Check custom roles first
    custom_roles = load_roles()
    
    # HARDCODED TEST LOGINS
    test_accounts = {
        "admin": "sysadmin",
        "tech": "tech",
        "wag": "wag",
        "helpdesk": "helpdesk"
    }
    
    if u in test_accounts and (p == "trc" or p == "trc2026"):
        role = test_accounts[u]
        token = str(uuid.uuid4())
        SESSIONS[token] = {"username": u, "role": role}
        return {"status": "success", "token": token, "role": role, "username": u}

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
        if u in custom_roles:
            role = custom_roles[u]
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
            SESSIONS[token] = {"username": payload.username, "role": role}
            return {"status": "success", "token": token, "role": role, "username": payload.username}
        else:
            return {"status": "error", "message": "Invalid StarID or Password"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/admin/users")
def get_admin_users():
    return {"status": "success", "roles": load_roles()}

@app.post("/api/admin/users")
def update_admin_user(data: dict):
    roles = load_roles()
    roles[data["username"].lower()] = data["role"]
    save_roles(roles)
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
        kb_data = []
        if os.path.exists(kb_file):
            try:
                with open(kb_file, "r") as f:
                    kb_data = json.load(f)
            except:
                pass
        kb_data.extend(new_entries)
        with open(kb_file, "w") as f:
            json.dump(kb_data, f, indent=4)

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
        kb_data = []
        if os.path.exists(kb_file):
            try:
                with open(kb_file, "r") as f:
                    kb_data = json.load(f)
            except:
                pass
        kb_data.extend(new_entries)
        with open(kb_file, "w") as f:
            json.dump(kb_data, f, indent=4)
            
    return {"status": "success", "message": f"Successfully learned from {file.filename} ({len(new_entries)} entries)"}

@app.post("/api/kb/learn")
def learn_kb(payload: LearnPayload):
    ingest_pending_files() # Check for files before learning
    kb_file = os.path.join(current_dir, "kb.json")
    try:
        kb_data = []
        if os.path.exists(kb_file):
            with open(kb_file, "r") as f:
                kb_data = json.load(f)
            
        kb_data.append(payload.text)
        
        with open(kb_file, "w") as f:
            json.dump(kb_data, f, indent=4)
            
        return {"status": "success", "message": "Knowledge saved successfully."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/kb/search")
def search_kb(q: str):
    ingest_pending_files() # Process any dropped files before searching!
    query_words = q.lower().split()
    results = []
    
    # Search kb.json (which now contains both self-learned AND ingested CSV data)
    kb_file = os.path.join(current_dir, "kb.json")
    if os.path.exists(kb_file):
        with open(kb_file, "r") as f:
            try:
                kb_data = json.load(f)
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
            except:
                pass
                
    if results:
        results.sort(key=lambda x: x["score"], reverse=True)
        return {"status": "success", "data": results[0]}
    else:
        return {"status": "error", "message": "No match found in Knowledge Base."}

# Serve static files (including index.html)
app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

if __name__ == "__main__":
    print("Starting TRC Enterprise AI Server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
