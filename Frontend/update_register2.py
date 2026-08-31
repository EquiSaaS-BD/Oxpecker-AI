import os

filepath = 'src/app/(auth)/register/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_register = '''        const registeredUser = {
          id: `usr-${Date.now()}`,
          name: name || "Demo User",
          email: email || "demo@oxpecker.ai",
          role: formData.accountType || "doctor",
          isApproved: formData.accountType === "patient",
        };'''

new_register = '''        const registeredUser = {
          id: `usr-${Date.now()}`,
          name: name || "Demo User",
          email: email || "demo@oxpecker.ai",
          role: formData.accountType || "doctor",
          status: formData.accountType === "patient" ? "active" : "pending",
        };'''

content = content.replace(old_register, new_register)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
