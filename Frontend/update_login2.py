import os

filepath = 'src/app/(auth)/login/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_login = '''        login({
          id: `usr-${Date.now()}`,
          name: email.split("@")[0] || "Demo User",
          email: email || "demo@oxpecker.ai",
          role: role,
          isApproved: role === "patient" || role === "admin", // mock approval logic
        } as any);'''

new_login = '''        login({
          id: `usr-${Date.now()}`,
          name: email.split("@")[0] || "Demo User",
          email: email || "demo@oxpecker.ai",
          role: role,
          status: (role === "patient" || role === "admin") ? "active" : "pending", // mock approval logic
        } as any);'''

content = content.replace(old_login, new_login)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
