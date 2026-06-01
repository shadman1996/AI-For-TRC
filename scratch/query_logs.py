import sqlite3
import os

db_path = "c:\\Users\\wagahsan\\OneDrive - Minnesota State\\Desktop\\Shadman Ahsan\\TRC-AI-Assistant\\trc_ai.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Querying SQLite Admin Audit Logs ---")
cursor.execute("SELECT * FROM admin_audit_logs ORDER BY id DESC LIMIT 5")
for r in cursor.fetchall():
    print(r)

print("\n--- Querying SQLite Security Alerts ---")
cursor.execute("SELECT * FROM security_alerts ORDER BY id DESC LIMIT 5")
for r in cursor.fetchall():
    print(r)

conn.close()
