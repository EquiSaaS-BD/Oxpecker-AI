import os

filepath = 'src/context/AuthContext.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Modify AppUser interface
content = content.replace('assistantId?: string;\n  doctorId?: string;\n}', 'assistantId?: string;\n  doctorId?: string;\n  isApproved?: boolean;\n}')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
