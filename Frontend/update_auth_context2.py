import os

filepath = 'src/context/AuthContext.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('isApproved?: boolean;', 'status?: "active" | "pending" | "banned";')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
