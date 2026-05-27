import sys
import os

# Set search path to include parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import server
import database

def test_sso_endpoint():
    print("Testing Active Directory SSO Resolution...")
    
    # Verify sso_login() execution
    res = server.sso_login()
    print("SSO Route Result:")
    print(res)
    
    # Assertions
    assert res is not None, "SSO response should not be None."
    assert res.get("status") == "success", f"SSO status expected 'success', got '{res.get('status')}'. Message: {res.get('message')}"
    assert res.get("username") == "wagahsan", f"Expected resolved username to be 'wagahsan', got '{res.get('username')}'"
    assert res.get("role") == "sysadmin", f"Expected resolved role to be 'sysadmin', got '{res.get('role')}'"
    assert "token" in res, "SSO response should return a session token."
    assert len(res.get("modules", [])) > 0, "SSO response should load active user modules."
    
    # Check session registry
    token = res.get("token")
    assert token in server.SESSIONS, "Generated token must exist in server's SESSIONS registry."
    print("Session registered in-memory: PASS")
    
    # Verify audit logs
    logs = database.get_audit_logs(limit=5)
    sso_log_found = False
    for log in logs:
        if log.get("operator") == "wagahsan" and log.get("platform") == "AD SSO":
            sso_log_found = True
            print(f"Verified Audit Log Entry: {log}")
            break
            
    assert sso_log_found, "SSO login must write a security audit log entry."
    print("Security audit log verified: PASS")
    
    print("\n--- ALL AD SSO TESTS PASSED SUCCESSFULY! ---")

if __name__ == "__main__":
    test_sso_endpoint()
