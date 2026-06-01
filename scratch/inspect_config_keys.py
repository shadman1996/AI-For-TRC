import os
import json
from security import SecurityManager

config_path = "c:\\Users\\wagahsan\\OneDrive - Minnesota State\\Desktop\\Shadman Ahsan\\TRC-AI-Assistant\\config.json"
if os.path.exists(config_path):
    try:
        config = SecurityManager.load_secured_config(config_path)
        print("Config keys:", list(config.keys()))
        if "tdx" in config:
            print("TDX Config keys:", list(config["tdx"].keys()))
            print("TDX Username:", config["tdx"].get("username"))
        else:
            print("No 'tdx' key in config.")
    except Exception as e:
        print("Failed to load secure config:", e)
else:
    print("config.json not found.")
