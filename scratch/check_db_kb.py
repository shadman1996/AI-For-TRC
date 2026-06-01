import sqlite3
import re

db_path = "c:\\Users\\wagahsan\\OneDrive - Minnesota State\\Desktop\\Shadman Ahsan\\TRC-AI-Assistant\\trc_ai.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, content FROM kb WHERE source = 'SMSU KB Scraper'")
rows = cursor.fetchall()
print(f"Total crawled rows in database: {len(rows)}")

links = set()
for r in rows:
    content = r[1]
    # Find URL link in f"🔗 **Official KB Article**: {article_url}"
    m = re.search(r"Official KB Article\*\*: (https://\S+)<br>", content)
    if m:
        links.add(m.group(1))

print(f"\nDistinct Ingested Article URLs ({len(links)}):")
for l in sorted(links):
    print(" -", l)

conn.close()
