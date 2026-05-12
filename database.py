import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trc_ai.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # User Roles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        modules TEXT NOT NULL -- Store as JSON string
    )
    """)
    
    # Knowledge Base Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kb (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        source TEXT DEFAULT 'Manual'
    )
    """)

    # Scraped StarID Profiles Table (Cache)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scraped_profiles (
        starid TEXT PRIMARY KEY,
        profile_data TEXT, -- JSON string
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()
    print("SQLite Database initialized.")

# Cache Portal Scraper Operations
def get_cached_profile(starid):
    conn = get_db()
    row = conn.execute("SELECT * FROM scraped_profiles WHERE starid = ?", (starid.lower(),)).fetchone()
    conn.close()
    if row:
        data = json.loads(row["profile_data"])
        data["Source"] = "StarID Admin (Cached)"
        data["ScrapedAt"] = row["scraped_at"]
        return data
    return None

def save_profile_cache(starid, profile_dict):
    conn = get_db()
    conn.execute("""
        INSERT OR REPLACE INTO scraped_profiles (starid, profile_data, scraped_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    """, (starid.lower(), json.dumps(profile_dict)))
    conn.commit()
    conn.close()

def migrate_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    roles_path = os.path.join(current_dir, "roles.json")
    kb_path = os.path.join(current_dir, "kb.json")
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Migrate Roles
    if os.path.exists(roles_path):
        print("Migrating roles.json to SQLite...")
        with open(roles_path, "r") as f:
            try:
                roles = json.load(f)
                for username, data in roles.items():
                    role = data if isinstance(data, str) else data.get("role", "helpdesk")
                    modules = data.get("modules", []) if isinstance(data, dict) else []
                    cursor.execute("INSERT OR IGNORE INTO users (username, role, modules) VALUES (?, ?, ?)", 
                                   (username.lower(), role, json.dumps(modules)))
            except Exception as e:
                print(f"Error migrating roles: {e}")
                
    # Migrate KB
    if os.path.exists(kb_path):
        print("Migrating kb.json to SQLite...")
        with open(kb_path, "r") as f:
            try:
                kb_data = json.load(f)
                for item in kb_data:
                    cursor.execute("INSERT INTO kb (content) VALUES (?)", (item,))
            except Exception as e:
                print(f"Error migrating KB: {e}")
                
    conn.commit()
    conn.close()
    print("Migration complete.")

# User Operations
def get_user(username):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username.lower(),)).fetchone()
    conn.close()
    if user:
        return {
            "username": user["username"],
            "role": user["role"],
            "modules": json.loads(user["modules"])
        }
    return None

def get_all_users():
    conn = get_db()
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    return {u["username"]: {"role": u["role"], "modules": json.loads(u["modules"])} for u in users}

def upsert_user(username, role, modules):
    conn = get_db()
    conn.execute("INSERT OR REPLACE INTO users (username, role, modules) VALUES (?, ?, ?)", 
                 (username.lower(), role, json.dumps(modules)))
    conn.commit()
    conn.close()

def delete_user(username):
    conn = get_db()
    conn.execute("DELETE FROM users WHERE username = ?", (username.lower(),))
    conn.commit()
    conn.close()

# KB Operations
def add_kb_entry(content, source="Manual"):
    conn = get_db()
    conn.execute("INSERT INTO kb (content, source) VALUES (?, ?)", (content, source))
    conn.commit()
    conn.close()

def get_all_kb():
    conn = get_db()
    entries = conn.execute("SELECT content FROM kb").fetchall()
    conn.close()
    return [e["content"] for e in entries]

# --- TDX LOCAL DATABASE INTEGRATION ---
def query_tdx_user(query_str):
    tdx_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "TDX"))
    users_csv = os.path.join(tdx_dir, "TDXUsers.csv")
    if not os.path.exists(users_csv):
        return []
        
    query_str = query_str.lower().strip()
    results = []
    
    try:
        with open(users_csv, "r", encoding="utf-8-sig") as f:
            import csv
            reader = csv.DictReader(f)
            for row in reader:
                username = row.get("UserName", "") or ""
                fullname = row.get("FullName", "") or ""
                beid = row.get("BEID", "") or ""
                
                if (query_str in username.lower() or 
                    query_str in fullname.lower() or 
                    query_str == beid.lower()):
                    
                    results.append({
                        "UID": row.get("UID"),
                        "StarID": username,
                        "FullName": fullname,
                        "FirstName": row.get("FirstName"),
                        "LastName": row.get("LastName"),
                        "PrimaryEmail": row.get("PrimaryEmail"),
                        "AlternateEmail": row.get("AlternateEmail"),
                        "Title": row.get("Title"),
                        "Phone": row.get("PrimaryPhone") or row.get("WorkPhone") or row.get("MobilePhone") or "N/A",
                        "Location": row.get("LocationName"),
                        "Room": row.get("LocationRoomName"),
                        "IsActive": row.get("IsActive"),
                        "TechID": beid,
                        "Source": "TDX Database Dump"
                    })
    except Exception as e:
        print("Error reading TDX Users:", e)
        
    return results

def query_tdx_asset(query_str):
    tdx_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "TDX"))
    assets_csv = os.path.join(tdx_dir, "TDXAssets.csv")
    if not os.path.exists(assets_csv):
        return []
        
    query_str = query_str.lower().strip()
    # Strip colons or dashes from MAC queries to make it highly search resilient
    query_clean = query_str.replace(":", "").replace("-", "")
    results = []
    
    try:
        with open(assets_csv, "r", encoding="utf-8-sig") as f:
            import csv
            reader = csv.DictReader(f)
            for row in reader:
                tag = row.get("Tag", "") or ""
                serial = row.get("SerialNumber", "") or ""
                name = row.get("Name", "") or ""
                attributes = row.get("Attributes", "") or ""
                
                tag_match = query_str in tag.lower()
                serial_match = query_str in serial.lower()
                name_match = query_str in name.lower()
                
                attr_match = False
                if query_clean and len(query_clean) >= 12:
                    attr_match = query_clean in attributes.lower().replace(":", "").replace("-", "")
                    
                if tag_match or serial_match or name_match or attr_match:
                    results.append({
                        "ID": row.get("ID"),
                        "Tag": tag,
                        "SerialNumber": serial,
                        "Name": name,
                        "ProductModel": row.get("ProductModelName"),
                        "Manufacturer": row.get("ManufacturerName"),
                        "Status": row.get("StatusName"),
                        "Location": row.get("LocationName"),
                        "Room": row.get("LocationRoomName"),
                        "Owner": row.get("RequestingCustomerName") or row.get("OwningCustomerName") or "N/A",
                        "OwnerDepartment": row.get("RequestingDepartmentName") or row.get("OwningDepartmentName") or "N/A",
                        "CreatedDate": row.get("CreatedDate"),
                        "Source": "TDX Asset Catalog"
                    })
    except Exception as e:
        print("Error reading TDX Assets:", e)
        
    return results

if __name__ == "__main__":
    init_db()
    migrate_data()
