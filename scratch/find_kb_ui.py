import re
import sys

def search_file(filepath, pattern):
    safe_print = lambda msg: sys.stdout.buffer.write((msg + '\n').encode('utf-8', errors='ignore'))
    safe_print(f"Searching for '{pattern}' in {filepath}...")
    rx = re.compile(pattern, re.IGNORECASE)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f, 1):
            if rx.search(line):
                safe_print(f"{idx}: {line.strip()}")

if __name__ == "__main__":
    search_file("app.js", r"/kb|learn_kb|upload_kb")
