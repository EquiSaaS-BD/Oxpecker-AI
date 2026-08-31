import os
import re

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return # Skip binary files

    new_content = re.sub(r'(?i)Oxpecker\s*ai', 'Oxpecker', content)
    new_content = re.sub(r'(?i)Oxpecker', 'Oxpecker', new_content)
    new_content = re.sub(r'(?i)Oxpecker', 'Oxpecker', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('.'):
    # Skip standard ignore dirs
    dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next', '__pycache__', 'venv', 'env', '.vercel', '.gemini']]
    for file in files:
        if file.endswith('.pyc') or file.endswith('.png') or file.endswith('.jpg') or file.endswith('.ico') or file.endswith('.pptx') or file.endswith('.json'):
            if not file.endswith('package.json') and not file.endswith('doctorsDb.json') and not file.endswith('manifest.json'):
                continue
        filepath = os.path.join(root, file)
        process_file(filepath)

print('Done replacing.')
