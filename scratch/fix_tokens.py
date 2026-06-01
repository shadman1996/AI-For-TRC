with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("fetch('/api/admin/remote-script', {", "fetch(`/api/admin/remote-script?token=${currentUser.token}`, {")
content = content.replace("fetch('/api/admin/remote-script/bulk', {", "fetch(`/api/admin/remote-script/bulk?token=${currentUser.token}`, {")
# Note: The status endpoint is already correctly using a template literal, just missing the query param
content = content.replace("fetch(`/api/admin/remote-script/bulk/status/${batchId}`);", "fetch(`/api/admin/remote-script/bulk/status/${batchId}?token=${currentUser.token}`);")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
