import os
import re

for root, dirs, files in os.walk('.'):
    # Skip standard ignore dirs
    dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next', '__pycache__', 'venv', 'env', '.vercel', '.gemini']]
    for file in files:
        if file.endswith('.pyc') or file.endswith('.png') or file.endswith('.jpg') or file.endswith('.ico') or file.endswith('.pptx') or file.endswith('.json'):
            if not file.endswith('package.json') and not file.endswith('doctorsDb.json') and not file.endswith('manifest.json'):
                continue
        filepath = os.path.join(root, file)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                if re.search(r'(?i)shushthota', content):
                    print(f"Found in: {filepath}")
        except:
            pass
