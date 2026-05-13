import os
import sqlite3
import csv

db_path = "trc_ai.db"
tdx_dir = r"C:\Users\wagahsan\OneDrive - Minnesota State\Desktop\Shadman Ahsan\TDX"
users_csv = os.path.join(tdx_dir, "TDXUsers.csv")
assets_csv = os.path.join(tdx_dir, "TDXAssets.csv")

print(f"db_path: {os.path.abspath(db_path)}")
print(f"tdx_dir: {tdx_dir}")
print(f"users_csv exists: {os.path.exists(users_csv)}")

if os.path.exists(users_csv):
    with open(users_csv, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        print(f"CSV Headers: {reader.fieldnames}")
        users_to_insert = []
        for i, row in enumerate(reader):
            users_to_insert.append((
                row.get("UID"), row.get("UserName"), row.get("FullName"),
                row.get("FirstName"), row.get("LastName"), row.get("PrimaryEmail"),
                row.get("Title"), row.get("PrimaryPhone"), row.get("LocationName"),
                row.get("LocationRoomName"), row.get("BEID"), row.get("DefaultAccountName")
            ))
            if i < 2:
                print(f"Row {i} parsed: {users_to_insert[-1]}")
        print(f"Total rows parsed from CSV: {len(users_to_insert)}")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
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
        cursor.executemany("INSERT OR REPLACE INTO tdx_users VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", users_to_insert)
        conn.commit()
        
        rows = cursor.execute("SELECT count(*) FROM tdx_users").fetchone()
        print(f"Total rows in tdx_users after insert: {rows[0]}")
        conn.close()
