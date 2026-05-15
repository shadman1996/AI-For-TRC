import sqlite3
import json
import os
import csv

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trc_ai.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. User Roles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        modules TEXT NOT NULL
    )
    """)
    
    # 2. Knowledge Base Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kb (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        source TEXT DEFAULT 'Manual'
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kb_content ON kb(content)")

    # 3. Scraped StarID Profiles Table (Cache)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scraped_profiles (
        starid TEXT PRIMARY KEY,
        profile_data TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 4. TDX Users Table (High-Speed SQL)
    try:
        cursor.execute("SELECT department FROM tdx_users LIMIT 1")
    except sqlite3.OperationalError:
        cursor.execute("DROP TABLE IF EXISTS tdx_users")
        
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tdx_users (
        uid TEXT PRIMARY KEY,
        username TEXT,
        fullname TEXT,
        firstname TEXT,
        lastname TEXT,
        email TEXT,
        title TEXT,
        phone TEXT,
        location TEXT,
        room TEXT,
        beid TEXT,
        department TEXT
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tdx_user_username ON tdx_users(username)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tdx_user_fullname ON tdx_users(fullname)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tdx_user_beid ON tdx_users(beid)")

    # 5. TDX Assets Table (High-Speed SQL)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tdx_assets (
        id TEXT PRIMARY KEY,
        tag TEXT,
        serial TEXT,
        name TEXT,
        model TEXT,
        manufacturer TEXT,
        status TEXT,
        location TEXT,
        room TEXT,
        owner TEXT,
        owner_dept TEXT,
        attributes TEXT
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tdx_asset_tag ON tdx_assets(tag)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tdx_asset_serial ON tdx_assets(serial)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tdx_asset_name ON tdx_assets(name)")

    # 5.5 TDX Locations Table (High-Speed SQL)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tdx_locations (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        is_active TEXT,
        address TEXT
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tdx_location_name ON tdx_locations(name)")

    # 6. Admin Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        operator TEXT NOT NULL,
        platform TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()
    print("SQLite Database & High-Performance Indexes initialized.")
    
    # Auto-migrate if the tdx_users table is empty
    conn = get_db()
    cursor = conn.cursor()
    try:
        count = cursor.execute("SELECT count(*) FROM tdx_users").fetchone()[0]
    except Exception:
        count = 0
    conn.close()
    
    if count == 0:
        print("tdx_users is empty. Migrating CSV data to SQLite...")
        migrate_csv_to_sqlite()
 
def migrate_csv_to_sqlite():
    """Migrates 10,000+ CSV records to indexed SQLite tables for O(1) lookup speed."""
    tdx_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "TDX"))
    users_csv = os.path.join(tdx_dir, "TDXUsers.csv")
    assets_csv = os.path.join(tdx_dir, "TDXAssets.csv")
    
    conn = get_db()
    
    # Sync Users
    if os.path.exists(users_csv):
        print("Optimizing User Directory (CSV -> SQLite)...")
        with open(users_csv, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            users_to_insert = []
            for row in reader:
                users_to_insert.append((
                    row.get("UID"), row.get("UserName"), row.get("FullName"),
                    row.get("FirstName"), row.get("LastName"), row.get("PrimaryEmail"),
                    row.get("Title"), row.get("PrimaryPhone"), row.get("LocationName"),
                    row.get("LocationRoomName"), row.get("BEID"), row.get("DefaultAccountName")
                ))
            conn.executemany("INSERT OR REPLACE INTO tdx_users VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", users_to_insert)

    # Sync Assets
    if os.path.exists(assets_csv):
        print("Optimizing Asset Inventory (CSV -> SQLite)...")
        with open(assets_csv, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            assets_to_insert = []
            for row in reader:
                assets_to_insert.append((
                    row.get("ID"), row.get("Tag"), row.get("SerialNumber"),
                    row.get("Name"), row.get("ProductModelName"), row.get("ManufacturerName"),
                    row.get("StatusName"), row.get("LocationName"), row.get("LocationRoomName"),
                    row.get("RequestingCustomerName") or row.get("OwningCustomerName"),
                    row.get("RequestingDepartmentName") or row.get("OwningDepartmentName"),
                    row.get("Attributes")
                ))
            conn.executemany("INSERT OR REPLACE INTO tdx_assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", assets_to_insert)

    # Sync Locations
    locations_csv = os.path.join(tdx_dir, "TDXLocations.csv")
    if os.path.exists(locations_csv):
        print("Optimizing Campus Locations (CSV -> SQLite)...")
        with open(locations_csv, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            locations_to_insert = []
            for row in reader:
                locations_to_insert.append((
                    row.get("ID"), row.get("Name"), row.get("Description"),
                    row.get("IsActive"), row.get("Address")
                ))
            conn.executemany("INSERT OR REPLACE INTO tdx_locations VALUES (?,?,?,?,?)", locations_to_insert)

    conn.commit()
    conn.close()
    print("CSV Intelligence Migration Complete.")

# --- OPTIMIZED SEARCH ALGORITHMS ---

def query_tdx_user(query_str):
    query_str = query_str.lower().strip()
    words = [w.strip() for w in query_str.split() if w.strip()]
    if not words:
        return []
        
    conn = get_db()
    # We construct a dynamic SQL intersection query to match ALL keywords.
    # Each keyword can match either username, fullname, department, or title.
    sql = "SELECT * FROM tdx_users WHERE "
    conditions = []
    params = []
    for w in words:
        conditions.append("(username LIKE ? OR fullname LIKE ? OR department LIKE ? OR title LIKE ? OR beid = ?)")
        params.extend([f"%{w}%", f"%{w}%", f"%{w}%", f"%{w}%", w])
    sql += " AND ".join(conditions) + " LIMIT 10"
    
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    
    results = []
    for row in rows:
        results.append({
            "UID": row["uid"], "StarID": row["username"], "FullName": row["fullname"],
            "FirstName": row["firstname"], "LastName": row["lastname"],
            "PrimaryEmail": row["email"], "Title": row["title"], "Phone": row["phone"],
            "Location": row["location"], "Room": row["room"], "TechID": row["beid"],
            "Department": row["department"],
            "Source": "Indexed TDX Directory"
        })
    return results

def detect_role_from_metadata(username):
    """Predicts a role based on the user's title and department in the directory."""
    results = query_tdx_user(username)
    if not results:
        return "guest"
    
    user = results[0]
    title = (user.get("Title") or "").lower()
    dept = (user.get("Department") or "").lower()
    
    if any(kw in title for kw in ["admin", "director", "manager", "coordinator"]):
        return "sysadmin"
    if any(kw in title for kw in ["technician", "engineer", "specialist"]) or "its" in dept:
        return "tech"
    if any(kw in title for kw in ["student worker", "help desk"]) or "trc" in dept:
        return "helpdesk"
        
    return "guest"

def query_tdx_asset(query_str):
    query_str = query_str.lower().strip()
    words = [w.strip() for w in query_str.split() if w.strip()]
    if not words:
        return []
        
    conn = get_db()
    # Check exact tag or serial if they are single word/token (High priority)
    if len(words) == 1:
        exact = words[0]
        # First try exact tag match
        exact_match = conn.execute("SELECT * FROM tdx_assets WHERE tag = ? COLLATE NOCASE OR serial = ? COLLATE NOCASE", (exact, exact)).fetchall()
        if exact_match:
            conn.close()
            return [ {
                "ID": row["id"], "Tag": row["tag"], "SerialNumber": row["serial"],
                "Name": row["name"], "ProductModel": row["model"], "Manufacturer": row["manufacturer"],
                "Status": row["status"], "Location": row["location"], "Room": row["room"],
                "Owner": row["owner"], "OwnerDepartment": row["owner_dept"], "Source": "Exact Asset Match"
            } for row in exact_match ]

        # If no exact, try partial
        rows = conn.execute("""
            SELECT * FROM tdx_assets 
            WHERE tag LIKE ? OR serial LIKE ? OR name LIKE ? OR attributes LIKE ?
            LIMIT 10
        """, (f"%{exact}%", f"%{exact}%", f"%{exact}%", f"%{exact}%")).fetchall()
    else:
        # Dynamic SQL intersection for multi-word
        sql = "SELECT * FROM tdx_assets WHERE "
        conditions = []
        params = []
        for w in words:
            conditions.append("(tag LIKE ? OR serial LIKE ? OR name LIKE ? OR owner LIKE ? OR owner_dept LIKE ? OR attributes LIKE ?)")
            params.extend([f"%{w}%", f"%{w}%", f"%{w}%", f"%{w}%", f"%{w}%", f"%{w}%"])
        sql += " AND ".join(conditions) + " LIMIT 10"
        rows = conn.execute(sql, params).fetchall()
        
    conn.close()
    
    results = []
    for row in rows:
        results.append({
            "ID": row["id"], "Tag": row["tag"], "SerialNumber": row["serial"],
            "Name": row["name"], "ProductModel": row["model"], "Manufacturer": row["manufacturer"],
            "Status": row["status"], "Location": row["location"], "Room": row["room"],
            "Owner": row["owner"], "OwnerDepartment": row["owner_dept"], "Source": "Indexed Asset Catalog"
        })
    return results

def query_tdx_location(query_str):
    query_str = query_str.lower().strip()
    words = [w.strip() for w in query_str.split() if w.strip()]
    if not words:
        return []
        
    conn = get_db()
    
    # Check exact match for name (High priority)
    if len(words) == 1:
        exact = words[0]
        exact_match = conn.execute("SELECT * FROM tdx_locations WHERE name = ? COLLATE NOCASE", (exact,)).fetchall()
        if exact_match:
            conn.close()
            return [ {
                "ID": row["id"], "Name": row["name"], "Description": row["description"],
                "IsActive": row["is_active"], "Address": row["address"], "Source": "Exact Location Match"
            } for row in exact_match ]

        # If no exact, try partial
        rows = conn.execute("""
            SELECT * FROM tdx_locations 
            WHERE name LIKE ? OR description LIKE ? OR address LIKE ?
            LIMIT 10
        """, (f"%{exact}%", f"%{exact}%", f"%{exact}%")).fetchall()
    else:
        # Dynamic SQL intersection for multi-word
        sql = "SELECT * FROM tdx_locations WHERE "
        conditions = []
        params = []
        for w in words:
            conditions.append("(name LIKE ? OR description LIKE ? OR address LIKE ?)")
            params.extend([f"%{w}%", f"%{w}%", f"%{w}%"])
        sql += " AND ".join(conditions) + " LIMIT 10"
        rows = conn.execute(sql, params).fetchall()
        
    conn.close()
    
    results = []
    for row in rows:
        results.append({
            "ID": row["id"], "Name": row["name"], "Description": row["description"],
            "IsActive": row["is_active"], "Address": row["address"], "Source": "Indexed Location Catalog"
        })
    return results

# --- LEGACY METHODS (MIGRATED TO SQL) ---

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
    conn.execute("INSERT OR REPLACE INTO scraped_profiles (starid, profile_data, scraped_at) VALUES (?, ?, CURRENT_TIMESTAMP)", 
                 (starid.lower(), json.dumps(profile_dict)))
    conn.commit()
    conn.close()

def get_user(username):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username.lower(),)).fetchone()
    conn.close()
    return {"username": user["username"], "role": user["role"], "modules": json.loads(user["modules"])} if user else None

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

def get_all_tickets():
    # Placeholder: currently tickets are managed via TeamDynamix API in server.py
    # This function prevents crashes when calculating dashboard stats.
    return []

def migrate_data():
    """Migrates older JSON files and CSVs to unified SQLite engine."""
    init_db()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    roles_path = os.path.join(current_dir, "roles.json")
    kb_path = os.path.join(current_dir, "kb.json")
    
    conn = get_db()
    # Migrate Roles JSON
    if os.path.exists(roles_path):
        with open(roles_path, "r") as f:
            roles = json.load(f)
            for u, d in roles.items():
                r = d if isinstance(d, str) else d.get("role", "helpdesk")
                m = d.get("modules", []) if isinstance(d, dict) else []
                conn.execute("INSERT OR IGNORE INTO users (username, role, modules) VALUES (?, ?, ?)", (u.lower(), r, json.dumps(m)))
    
    # Migrate KB JSON
    if os.path.exists(kb_path):
        with open(kb_path, "r") as f:
            kb_data = json.load(f)
            for item in kb_data:
                conn.execute("INSERT INTO kb (content) VALUES (?)", (item,))
    
    conn.commit()
    conn.close()
    migrate_csv_to_sqlite()

def add_audit_log(operator, platform, action, target):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO admin_audit_logs (operator, platform, action, target)
        VALUES (?, ?, ?, ?)
    """, (operator, platform, action, target))
    conn.commit()
    conn.close()

def get_audit_logs(limit=100):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == "__main__":
    migrate_data()
