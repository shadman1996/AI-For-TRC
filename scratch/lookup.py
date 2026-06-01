import sqlite3
try:
    conn = sqlite3.connect('trc_ai.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Check column names of tdx_assets
    cursor.execute("PRAGMA table_info(tdx_assets)")
    cols = [r[1] for r in cursor.fetchall()]
    print("\ntdx_assets columns:", cols)
    
    # Let's search ALL columns for the MAC address just in case
    query = "SELECT * FROM tdx_assets WHERE " + " OR ".join([f"{col} LIKE '%B4:0E:DE:69:A9:E2%'" for col in cols])
    cursor.execute(query)
    rows = cursor.fetchall()
    print("\nResults for MAC B4:0E:DE:69:A9:E2:")
    for row in rows:
        print(dict(row))
        
except Exception as e:
    print(f"Error: {e}")
