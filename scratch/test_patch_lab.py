import sys
import os

# Set search path to include parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import server
import database
from pydantic import BaseModel

class DummyPayload(BaseModel):
    patch_id: str

def test_patch_lab():
    print("Initializing Code Patch Lab Verification...")
    
    # 1. Setup mock sysadmin user session
    mock_user = {"username": "wagahsan", "role": "sysadmin"}
    
    # 2. Test patch listing
    print("\n[Step 1] Querying available patches from Patch Lab DB...")
    res_list = server.list_patches(user=mock_user)
    assert res_list.get("status") == "success", "Failed to retrieve patches."
    patches = res_list.get("patches", [])
    print(f"Total proposed patches: {len(patches)}")
    for p in patches:
        print(f"  - {p['id']}: {p['name']} ({p['status']})")
        assert len(p["diff"]) > 0, f"Diff for {p['id']} should not be empty."
    print("Proposed patches list & diff generation: PASS")
    
    # Define verification signatures for each patch
    patch_verifications = {
        "patch_1": {
            "sig": "_vitals_cache = {}",
            "name": "SLA Analytics Cache Layer"
        },
        "patch_2": {
            "sig": "Log size exceeds 1MB. Initiating log rotation.",
            "name": "Self-Optimizing Log-Rotation Buffer"
        },
        "patch_3": {
            "sig": "userAccountControl:1.2.840.113556.1.4.803:=2",
            "name": "Active Directory LDAP Filter Hardening"
        }
    }
    
    for pid, info in patch_verifications.items():
        print(f"\n--- TESTING PATCH '{pid}' ({info['name']}) ---")
        payload = DummyPayload(patch_id=pid)
        sig = info["sig"]
        
        # Ensure patch starts as Available
        res_list = server.list_patches(user=mock_user)
        patch_info = next(p for p in res_list["patches"] if p["id"] == pid)
        assert patch_info["status"] == "Available", f"Patch '{pid}' should start as Available."
        
        # Verify initial count of the unique signature is 1 (in PATCHES_DB only)
        with open("server.py", "r", encoding="utf-8") as f:
            content = f.read()
        assert content.count(sig) == 1, f"Signature count for {pid} should initially be 1."
        
        # Apply Patch
        print(f"Applying patch '{pid}'...")
        res_apply = server.apply_patch(payload=payload, user=mock_user)
        assert res_apply.get("status") == "success", f"Failed to apply patch {pid}: {res_apply.get('message')}"
        print(f"Patch {pid} application: PASS")
        
        # Verify filesystem modification on server.py
        with open("server.py", "r", encoding="utf-8") as f:
            content_applied = f.read()
        assert content_applied.count(sig) == 2, f"Signature count for {pid} should be 2 after application."
        print(f"Filesystem verification for {pid}: PASS")
        
        # Verify audit logs
        logs = database.get_audit_logs(limit=10)
        audit_found = False
        for log in logs:
            if log.get("operator") == "wagahsan" and log.get("platform") == "Patch Lab" and "Apply Patch Success" in log.get("action") and pid in log.get("target"):
                audit_found = True
                print(f"  Verified Audit Log: {log}")
                break
        assert audit_found, f"Patch application audit log for {pid} missing!"
        print(f"Audit log verification for {pid}: PASS")
        
        # Revert Patch
        print(f"Reverting patch '{pid}'...")
        res_revert = server.revert_patch(payload=payload, user=mock_user)
        assert res_revert.get("status") == "success", f"Failed to revert patch {pid}: {res_revert.get('message')}"
        print(f"Patch {pid} reversion: PASS")
        
        # Verify file is reverted on disk
        with open("server.py", "r", encoding="utf-8") as f:
            content_reverted = f.read()
        assert content_reverted.count(sig) == 1, f"Signature count for {pid} should be 1 after reversion."
        print(f"Filesystem reversion verification for {pid}: PASS")
        
        # Verify audit logs for revert
        logs = database.get_audit_logs(limit=10)
        revert_audit_found = False
        for log in logs:
            if log.get("operator") == "wagahsan" and log.get("platform") == "Patch Lab" and "Revert Patch Success" in log.get("action") and pid in log.get("target"):
                revert_audit_found = True
                print(f"  Verified Revert Audit Log: {log}")
                break
        assert revert_audit_found, f"Patch reversion audit log for {pid} missing!"
        print(f"Audit log reversion verification for {pid}: PASS")

    print("\n--- ALL PATCH LAB VERIFICATIONS FOR ALL 3 PATCHES PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_patch_lab()
