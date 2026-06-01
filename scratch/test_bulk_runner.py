import requests
import time
import os

def run_test():
    base_url = "http://localhost:8001"
    
    # 1. Login to get token
    print("--- Authenticating with TRC AI Gateway ---")
    login_payload = {
        "username": "wagahsan",
        "password": "trc2026"
    }
    try:
        res = requests.post(f"{base_url}/api/auth/login", json=login_payload, timeout=5)
        res_data = res.json()
        if res_data.get("status") != "success":
            print("Login failed! Response:", res_data)
            return
        
        token = res_data["token"]
        print(f"Logged in successfully. Token: {token}")
    except Exception as e:
        print(f"Failed to connect to local server at {base_url}. Error: {e}")
        print("Please ensure the FastAPI server is running before executing tests.")
        return

    # 2. Setup mock script
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    mock_script = os.path.join(curr_dir, "mock_installer.ps1")
    print(f"Target upgrade script path: {mock_script}")
    
    # 3. Trigger Bulk Script execution (Dry/Test run)
    print("\n--- Posting Bulk Remote PowerShell Script Execution ---")
    # We pass both 127.0.0.1 (local, should have online WSMan or if not online, it will skip gracefully)
    # and a completely bogus offline hostname: OFFLINE-WORKSTATION-X
    form_data = {
        "script_path": mock_script,
        "hostnames": "127.0.0.1,OFFLINE-WORKSTATION-X"
    }
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        res_bulk = requests.post(
            f"{base_url}/api/admin/remote-script/bulk", 
            data=form_data, 
            headers=headers,
            timeout=10
        )
        bulk_data = res_bulk.json()
        if bulk_data.get("status") != "success":
            print("Failed to dispatch bulk script run. Error:", bulk_data)
            return
        
        batch_id = bulk_data["batch_id"]
        print(f"Dispatched bulk upgrades successfully! Batch ID: {batch_id}")
        print(f"Message: {bulk_data.get('message')}")
    except Exception as e:
        print(f"HTTP POST request to bulk endpoint failed: {e}")
        return

    # 4. Poll status until completion
    print("\n--- Polling Bulk Telemetry Status ---")
    completed = False
    for attempt in range(15):
        time.sleep(2)
        try:
            res_status = requests.get(
                f"{base_url}/api/admin/remote-script/bulk/status/{batch_id}",
                headers=headers,
                timeout=5
            )
            status_data = res_status.json()
            batch_status = status_data.get("status")
            devices = status_data.get("devices", {})
            
            print(f"[{attempt + 1}] Batch Status: {batch_status}")
            for pc, dev in devices.items():
                print(f"  - Device {pc} -> Connectivity: {dev['connectivity']} | Pre-Upgrade Version: {dev['pre_upgrade_version']} | Status: {dev['status']}")
            
            if batch_status == "completed":
                print("\n✅ Bulk Upgrades Processing is completed successfully!")
                completed = True
                break
        except Exception as e:
            print(f"Failed to fetch status: {e}")
            break
            
    if not completed:
        print("\n⚠️ Batch execution polling timed out or failed to complete.")

if __name__ == "__main__":
    run_test()
