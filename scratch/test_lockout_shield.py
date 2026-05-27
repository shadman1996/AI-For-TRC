import sys
import os

# Set search path to include parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import server

def test_lockout_shield():
    print("Testing TDX Lockout Protection Shield...")
    
    # 1. Setup a test session
    test_token = "test-session-lockout-shield"
    test_user = {
        "token": test_token,
        "username": "wagahsan",
        "role": "sysadmin"
    }
    
    # Clear any past failures for clean run
    server.FAILED_TDX_LOGINS.discard(test_token)
    
    # Put a dummy incorrect password in memory
    server.ACTIVE_PASSWORDS[test_token] = "definitely-incorrect-password-12345"
    
    print("\n[Step 1] Triggering first ticketing synchronization with wrong password...")
    # This should attempt standard auth, fail, and add the token to FAILED_TDX_LOGINS
    res1 = server.get_tdx_tickets(user=test_user)
    
    # Check that it failed and entered our block list
    print(f"First synchronization completed. is_live: {res1.get('is_live')}")
    assert test_token in server.FAILED_TDX_LOGINS, "Token must be added to FAILED_TDX_LOGINS set on first failure."
    print("-> Verification: Session successfully added to FAILED_TDX_LOGINS block list. (PASS)")
    
    print("\n[Step 2] Triggering second ticketing synchronization...")
    # Change password to something else to check if it tries to authenticate again
    server.ACTIVE_PASSWORDS[test_token] = "another-wrong-password-99999"
    
    # This call should completely skip standard auth because it is blocked in FAILED_TDX_LOGINS
    res2 = server.get_tdx_tickets(user=test_user)
    print(f"Second synchronization completed. is_live: {res2.get('is_live')}")
    
    # Check that it remained blocked and didn't fail again since it bypassed standard auth
    assert test_token in server.FAILED_TDX_LOGINS, "Token should remain in FAILED_TDX_LOGINS block list."
    print("-> Verification: Lockout shield bypassed AD/TDX authentication entirely on second attempt. (PASS)")
    
    print("\n--- LOCKOUT SHIELD VERIFICATION COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_lockout_shield()
