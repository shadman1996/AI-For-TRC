import sqlite3
import re
import sys

# Configure stdout to use UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

db_path = r"C:\Users\wagahsan\OneDrive - Minnesota State\Desktop\Shadman Ahsan\TRC-AI-Assistant\trc_ai.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT content FROM kb WHERE source = 'SMSU KB Scraper'")
rows = cur.fetchall()

print(f"Total articles in DB: {len(rows)}")
for i, r in enumerate(rows, 1):
    content = r[0]
    match = re.match(r"\*\*(.*?)\*\*", content)
    title = match.group(1) if match else "Untitled Article"
    
    # Extract Category if present
    cat_match = re.search(r"Category: (.*?)<br>", content)
    category = cat_match.group(1) if cat_match else "Unknown"
    
    print(f"{i}. {title} | Category: {category}")

conn.close()
