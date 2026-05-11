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
    
    conn.commit()
    conn.close()
    print("SQLite Database initialized.")

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

if __name__ == "__main__":
    init_db()
    migrate_data()
