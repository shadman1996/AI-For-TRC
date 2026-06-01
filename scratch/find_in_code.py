import re

def search_file(filepath, pattern):
    print(f"Searching for '{pattern}' in {filepath}...")
    rx = re.compile(pattern, re.IGNORECASE)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f, 1):
            if rx.search(line):
                print(f"{idx}: {line.strip()}")

if __name__ == "__main__":
    search_file("server.py", r"kb|knowledge|/api/|ollama|generate")
