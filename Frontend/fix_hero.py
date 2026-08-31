import re

filepath = 'src/components/landing/HeroSection.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the emergency tab
content = re.sub(
    r'\s*\{\s*id:\s*"emergency",[^}]+\},',
    '',
    content
)

# Change activeTab default
content = content.replace('useState("emergency")', 'useState("doctors")')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
