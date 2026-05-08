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

app = FastAPI(title="TRC Enterprise AI API")

# Mount static files for the frontend
current_dir = os.path.dirname(os.path.abspath(__file__))

# Active Directory Query via PowerShell
@app.get("/api/ad/{username}")
def query_ad(username: str):
    ps_script = f"""
    $searcher = New-Object DirectoryServices.DirectorySearcher
    $searcher.Filter = "(samaccountname={username})"
    $searcher.PropertiesToLoad.Add("displayname") | Out-Null
    $searcher.PropertiesToLoad.Add("title") | Out-Null
    $searcher.PropertiesToLoad.Add("department") | Out-Null
    $searcher.PropertiesToLoad.Add("lockouttime") | Out-Null
    $searcher.PropertiesToLoad.Add("pwdlastset") | Out-Null
    $result = $searcher.FindOne()
    if ($result) {{
        $props = $result.Properties
        $isLocked = if ($props["lockouttime"].Count -gt 0 -and $props["lockouttime"][0] -gt 0) {{ $true }} else {{ $false }}
        $obj = @{{
            DisplayName = if ($props["displayname"].Count -gt 0) {{ $props["displayname"][0] }} else {{ $null }}
            Title = if ($props["title"].Count -gt 0) {{ $props["title"][0] }} else {{ $null }}
            Department = if ($props["department"].Count -gt 0) {{ $props["department"][0] }} else {{ $null }}
            IsLocked = $isLocked
        }}
        $obj | ConvertTo-Json
    }} else {{
        Write-Output "NOT_FOUND"
    }}
    """
    try:
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=15)
        out = result.stdout.strip()
        if out == "NOT_FOUND":
            return {"status": "error", "message": f"User {username} not found in Active Directory."}
        if not out:
            return {"status": "error", "message": "Failed to query AD."}
        return {"status": "success", "data": json.loads(out)}
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

@app.get("/")
def read_root():
    return FileResponse(os.path.join(current_dir, "index.html"))

app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

if __name__ == "__main__":
    print("Starting TRC Enterprise AI Server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
