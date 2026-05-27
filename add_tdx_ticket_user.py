"""Encrypt and store TDX ticket credentials in config.json"""
import json
import sys
from security import SecurityManager

sm = SecurityManager()

# Get credentials from command line
if len(sys.argv) < 3:
    print("Usage: python add_tdx_ticket_user.py <username> <password>")
    sys.exit(1)

username = sys.argv[1]
password = sys.argv[2]

# Encrypt the password
encrypted = sm.encrypt(password)
print(f"Encrypted password: {encrypted[:30]}...")

# Update config.json
with open("config.json", "r") as f:
    config = json.load(f)

config["tdx"]["ticket_username"] = username
config["tdx"]["ticket_password"] = f"ENC({encrypted})"

with open("config.json", "w") as f:
    json.dump(config, f, indent=2)

print(f"Successfully stored TDX ticket credentials for '{username}' in config.json")
print("Restart the server for changes to take effect.")
