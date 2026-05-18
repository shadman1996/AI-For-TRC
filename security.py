import os
import json
from cryptography.fernet import Fernet

KEY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".secret.key")

class SecurityManager:
    _key = None

    @staticmethod
    def get_key():
        if SecurityManager._key:
            return SecurityManager._key
        
        if os.path.exists(KEY_FILE):
            with open(KEY_FILE, "rb") as f:
                SecurityManager._key = f.read()
        else:
            SecurityManager._key = Fernet.generate_key()
            with open(KEY_FILE, "wb") as f:
                f.write(SecurityManager._key)
            # Try to hide the file on Windows
            try:
                import ctypes
                ctypes.windll.kernel32.SetFileAttributesW(KEY_FILE, 0x02) # FILE_ATTRIBUTE_HIDDEN
            except:
                pass
        return SecurityManager._key

    @staticmethod
    def encrypt(text: str) -> str:
        if not text: return ""
        f = Fernet(SecurityManager.get_key())
        return f.encrypt(text.encode()).decode()

    @staticmethod
    def decrypt(token: str) -> str:
        if not token or not token.startswith("ENC("): return token
        try:
            f = Fernet(SecurityManager.get_key())
            clean_token = token[4:-1]
            return f.decrypt(clean_token.encode()).decode()
        except Exception:
            return "DECRYPTION_ERROR"

    @staticmethod
    def secure_config(config_path: str):
        """Encrypts sensitive fields in the config file if they are not already encrypted."""
        if not os.path.exists(config_path):
            return

        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)

        modified = False
        sensitive_keys = ["password", "api_key", "token", "wskey", "beid", "secret"]
        
        def recursive_secure(obj):
            nonlocal modified
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if any(sk in k.lower() for sk in sensitive_keys) and isinstance(v, str) and not v.startswith("ENC("):
                        obj[k] = f"ENC({SecurityManager.encrypt(v)})"
                        modified = True
                    else:
                        recursive_secure(v)
            elif isinstance(obj, list):
                for item in obj:
                    recursive_secure(item)

        recursive_secure(config)

        if modified:
            with open(config_path, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2)
            print(f"Config at {config_path} has been secured with encryption.")

    @staticmethod
    def load_secured_config(config_path: str):
        """Loads config and decrypts any ENC(...) fields."""
        if not os.path.exists(config_path):
            return {}

        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)

        def recursive_decrypt(obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if isinstance(v, str) and v.startswith("ENC("):
                        obj[k] = SecurityManager.decrypt(v)
                    else:
                        recursive_decrypt(v)
            elif isinstance(obj, list):
                for item in obj:
                    recursive_decrypt(item)

        recursive_decrypt(config)
        return config

if __name__ == "__main__":
    # Test encryption
    sm = SecurityManager()
    test_str = "SuperSecretPassword123"
    encrypted = sm.encrypt(test_str)
    decrypted = sm.decrypt(f"ENC({encrypted})")
    print(f"Test: {test_str} -> {encrypted[:10]}... -> {decrypted}")
    assert test_str == decrypted
    
    # Secure the main config
    config_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
    sm.secure_config(config_p)
