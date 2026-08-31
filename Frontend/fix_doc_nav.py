import re

filepath = 'src/components/dashboard/doctor/DoctorTopNav.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove imports
content = re.sub(r'import\s+\{\s*EmergencyPatientLookupModal\s*\}\s*from\s*"[^"]+";\n', '', content)
content = re.sub(r'import\s+\{\s*ShieldAlert\s*\}\s*from\s*"lucide-react";', '', content)

# Remove state
content = re.sub(r'const\s+\[showEmergencyModal,\s*setShowEmergencyModal\]\s*=\s*useState\(false\);\n', '', content)

# Remove button
button_pattern = r'\{\/\*\s*National Emergency Health Record Lookup Button\s*\*\/\}.*?<\/button>'
content = re.sub(button_pattern, '', content, flags=re.DOTALL)

# Remove modal
modal_pattern = r'\{\/\*\s*Emergency Modal\s*\*\/\}\s*<EmergencyPatientLookupModal.*?\/>'
content = re.sub(modal_pattern, '', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
