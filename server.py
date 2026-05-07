import subprocess
import json
import os
from fastapi import FastAPI, HTTPException
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

# SCCM Placeholder
@app.get("/api/sccm/{device_name}")
def query_sccm(device_name: str):
    # TODO: Implement SCCM WMI Query
    # Example: Get-WmiObject -Namespace "root\SMS\site_XYZ" -Query "SELECT * FROM SMS_R_System WHERE Name = 'device_name'"
    return {
        "status": "pending",
        "message": f"SCCM integration is not fully configured yet. Needs Site Code and Server Name to query device: {device_name}",
        "data": None
    }

# Juniper Mist Placeholder
@app.get("/api/mist/{mac_address}")
def query_mist(mac_address: str):
    # TODO: Implement requests.get to api.mist.com
    return {
        "status": "pending",
        "message": f"Juniper Mist API Token is required to query MAC address: {mac_address}",
        "data": None
    }

@app.get("/")
def read_root():
    return FileResponse(os.path.join(current_dir, "index.html"))

app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

if __name__ == "__main__":
    print("Starting TRC Enterprise AI Server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
