import subprocess

def query_user():
    ps_script = """
    $searcher = New-Object DirectoryServices.DirectorySearcher
    $searcher.Filter = "(samaccountname=wagahsan)"
    $res = $searcher.FindOne()
    if ($res) {
        $props = $res.Properties
        foreach ($key in $props.PropertyNames) {
            Write-Output "$key = $($props[$key][0])"
        }
    } else {
        Write-Output "User not found"
    }
    """
    try:
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=15)
        print("AD User Properties:")
        print(result.stdout)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    query_user()
