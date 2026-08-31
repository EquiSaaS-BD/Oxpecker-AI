import os

files = [
    'src/app/(app)/doctor/dashboard/layout.tsx',
    'src/app/(app)/hospital/dashboard/layout.tsx',
    'src/app/(app)/assistant/layout.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('if (user && !user.isApproved)', 'if (user && user.status === "pending")')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
