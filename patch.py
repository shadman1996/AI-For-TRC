import re

with open('server.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: AD Enrichment
ad_target = '        # Augment with directory.json data if available using robust name matching'
ad_end = '        return {"status": "success", "data": data}'
a = content.find(ad_target)
b = content.find(ad_end, a)
if a != -1 and b != -1:
    ad_fix = '''        # Augment with tdx_users database data since we migrated off directory.json
        try:
            for user in data:
                starid = user.get("StarID")
                display_name = user.get("DisplayName")
                
                matched_f = None
                if starid:
                    res = database.query_tdx_user(starid)
                    if res: matched_f = res[0]
                if not matched_f and display_name:
                    res = database.query_tdx_user(display_name)
                    if res: matched_f = res[0]
                    
                if matched_f:
                    user["Office"] = matched_f.get("Office")
                    user["Phone"] = matched_f.get("Phone")
                    if not user.get("Email") or user.get("Email") == "N/A":
                        user["Email"] = matched_f.get("PrimaryEmail")
                    if not user.get("Title") or user.get("Title") == "N/A":
                        user["Title"] = matched_f.get("Title")
                    if not user.get("Department") or user.get("Department") == "N/A":
                        user["Department"] = matched_f.get("Department")
                    user["TechID"] = matched_f.get("TechID")
        except Exception as ex:
            import logging
            logging.error(f"Augment AD with tdx_users DB failed: {ex}")
            
'''
    content = content[:a] + ad_fix + content[b:]

# Fix 2: SCCM URL
sccm_target = "$baseUrl = 'https://sccm.smsu.edu/AdminService/v1.0/Device'"
sccm_end = 'if not out or out == "[]":'
a2 = content.find(sccm_target)
b2 = content.find(sccm_end, a2)
if a2 != -1 and b2 != -1:
    sccm_fix = '''$url = "https://sccmpss.smsu.edu/AdminService/wmi/SMS_R_System?`$filter=LastLogonUserName eq '{username}'"
    try {{
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $result = Invoke-RestMethod -Uri $url -UseDefaultCredentials -ErrorAction Stop
        if ($result.value.Count -gt 0) {{
            $out = @()
            foreach ($device in $result.value) {{
                $obj = @{{
                    PCName = $device.Name
                    ResourceID = $device.ItemKey
                    User = $device.LastLogonUserName
                    IPAddress = if ($device.IPAddresses) {{ $device.IPAddresses -join ', ' }} else {{ 'N/A' }}
                    Model = $device.OperatingSystemNameandVersion
                    LastSeen = if ($device.LastLogonTimestamp) {{ $device.LastLogonTimestamp }} else {{ 'Active' }}
                    Status = 'Online'
                }}
                $out += $obj
            }}
            $out | ConvertTo-Json -Depth 2
        }} else {{
            "[]"
        }}
    }} catch {{
        Write-Output "ERROR: $($_.Exception.Message)"
    }}
    """
    try:
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=15)
        out = result.stdout.strip()
        
        if out.startswith("ERROR:"):
            return {"status": "error", "message": f"SCCM Query Failed: {out}"}
            
        '''
    content = content[:a2] + sccm_fix + content[b2:]
    content = content.replace('item.get("Name")', 'item.get("PCName")')
    content = content.replace('item.get("LastContactTime")', 'item.get("LastSeen")')

# Fix 3: TDX Fallback
tdx_target = 'if err_code == 403 or live_data is None:'
tdx_end = 'return {"status": "success", "data": fallback_tickets, "is_live": True, "auth_user": "wagahsan"}'
a3 = content.find(tdx_target)
b3 = content.find(tdx_end, a3)
if a3 != -1 and b3 != -1:
    tdx_fix = '''if err_code == 403 or live_data is None:
            logging.warning(f"[TDX] Cannot fetch live tickets (Error {err_code}).")
            return {"status": "error", "message": f"TDX Access Denied (Error {err_code}). The service account lacks access to the Ticketing App (181). To view live data, please log out and log back in with your real SMSU AD password."}
            
        # If we got here, we have real live data!
        '''
    content = content[:a3] + tdx_fix + content[b3 + len(tdx_end):]

with open('server.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("All patches applied!")
