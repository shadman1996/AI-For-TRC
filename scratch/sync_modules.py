import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import database
import json
import os
import security
from security import SecurityManager

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "config.json")
def load_config():
    if not os.path.exists(CONFIG_PATH): return {}
    return SecurityManager.load_secured_config(CONFIG_PATH)

CONFIG = load_config()
DEFAULTS = CONFIG.get("default_module_permissions", {})

def sync_modules():
    conn = database.get_db()
    users = conn.execute("SELECT username, role, modules FROM users").fetchall()
    
    for user in users:
        username = user["username"]
        role = user["role"]
        current_modules = json.loads(user["modules"])
        
        default_modules = DEFAULTS.get(role, [])
        
        # Merge modules to ensure jamf (and others) are added
        new_modules = list(set(current_modules + default_modules))
        
        print(f"Syncing {username} ({role})...")
        conn.execute("UPDATE users SET modules = ? WHERE username = ?", (json.dumps(new_modules), username))
    
    conn.commit()
    conn.close()
    print("User modules synchronization complete.")

if __name__ == "__main__":
    sync_modules()
