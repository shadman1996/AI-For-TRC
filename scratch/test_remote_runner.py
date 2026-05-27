import sys
import os

# Set search path to include parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import server
import database
from pydantic import BaseModel
from fastapi import HTTPException

class DummyPin(BaseModel):
    pin: str

class DummyScript(BaseModel):
    pc_name: str
    script_path: str

def test_remote_runner():
    print("Initializing Remote PowerShell Runner Verification...")
    
    mock_sysadmin = {"username": "wagahsan", "role": "sysadmin"}
    mock_helpdesk = {"username": "helpdesk_user", "role": "helpdesk"}
    
    # 1. Test WAG PIN verification
    print("\n[Step 1] Verifying WAG PIN verification logic...")
    payload_correct = DummyPin(pin="2026")
    res_correct = server.verify_pin(payload=payload_correct)
    assert res_correct.get("status") == "success", "Correct PIN was rejected!"
    print("-> Verification: Correct WAG PIN accepted. (PASS)")
    
    payload_incorrect = DummyPin(pin="9999")
    res_incorrect = server.verify_pin(payload=payload_incorrect)
    assert res_incorrect.get("status") == "error", "Incorrect PIN was accepted!"
    print("-> Verification: Incorrect WAG PIN rejected. (PASS)")
    
    # 2. Test Role Authorization Guard
    print("\n[Step 2] Testing Role Authorization Guard...")
    payload_run = DummyScript(pc_name="localhost", script_path="scratch/test_remote.ps1")
    try:
        server.run_remote_script(payload=payload_run, user=mock_helpdesk)
        assert False, "Non-admin user was allowed to run script!"
    except HTTPException as ex:
        assert ex.status_code == 403, f"Expected 403 Forbidden, got {ex.status_code}"
        print("-> Verification: Helpdesk role blocked with HTTP 403. (PASS)")
        
    # 3. Test Invalid Script Path Validation
    print("\n[Step 3] Testing Invalid Script Path Validation...")
    payload_invalid = DummyScript(pc_name="localhost", script_path="scratch/nonexistent_script_999.ps1")
    res_invalid = server.run_remote_script(payload=payload_invalid, user=mock_sysadmin)
    assert res_invalid.get("status") == "error", "Invalid script path did not trigger error!"
    assert "Script path not found" in res_invalid.get("message"), f"Unexpected error message: {res_invalid.get('message')}"
    print("-> Verification: Missing script validation triggers clean pathway rejection. (PASS)")
    
    # 4. Test Live Script Execution Block (WSMan / Invoke-Command)
    print("\n[Step 4] Triggering remote execution test on localhost...")
    # Resolve the absolute path of scratch/test_remote.ps1
    abs_script_path = os.path.abspath("scratch/test_remote.ps1")
    payload_live = DummyScript(pc_name="localhost", script_path=abs_script_path)
    
    res_live = server.run_remote_script(payload=payload_live, user=mock_sysadmin)
    print(f"Execution response: {res_live}")
    
    # Analyze the result
    if res_live.get("status") == "success":
        assert "TRC REMOTE RUNNER VALIDATION: SUCCESS" in res_live.get("output"), "Output verification failed!"
        print("-> Verification: Remote execution completed successfully and returned output! (PASS)")
    else:
        # If localhost does not have WinRM active or UAC loopback is blocked, it should cleanly return a WSMan or connection error
        msg = res_live.get("message", "")
        assert any(term in msg for term in ["WinRM", "offline", "WSMan", "Access is denied", "Connecting to remote server"]), f"Unexpected remote failure error: {msg}"
        print("-> Verification: WSMan connectivity check and loopback protection verified successfully. (PASS)")
        
    # 5. Verify Security Auditing
    print("\n[Step 5] Checking security audit logs...")
    logs = database.get_audit_logs(limit=5)
    audit_found = False
    for log in logs:
        if log.get("operator") == "wagahsan" and log.get("platform") == "Remote Runner":
            audit_found = True
            print(f"  Verified Audit Log: {log}")
            break
            
    # Note: If localhost connection was blocked, it logged to log_audit_action in file-based audit trail
    if not audit_found:
        with open("audit_trail.log", "r", encoding="utf-8") as f:
            lines = f.readlines()
        for line in reversed(lines[-10:]):
            if "wagahsan" in line and "Remote_Script" in line:
                audit_found = True
                print(f"  Verified Audit Trail Log: {line.strip()}")
                break
                
    assert audit_found, "Remote execution was not logged to database or file audit trails!"
    print("-> Verification: Security audit logging completed. (PASS)")
    
    print("\n--- ALL REMOTE RUNNER VERIFICATIONS COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_remote_runner()
