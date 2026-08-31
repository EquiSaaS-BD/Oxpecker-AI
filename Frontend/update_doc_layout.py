import os

filepath = 'src/app/(app)/doctor/dashboard/layout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if 'PendingApprovalModal' not in content:
    content = content.replace('import { AccessDeniedModal } from "@/components/doctor/AccessDeniedModal";', 'import { AccessDeniedModal } from "@/components/doctor/AccessDeniedModal";\nimport { PendingApprovalModal } from "@/components/shared/PendingApprovalModal";')

old_access = '''  if (!isAuthenticated || role !== "doctor") {
    return <AccessDeniedModal />;
  }'''

new_access = '''  if (!isAuthenticated || role !== "doctor") {
    return <AccessDeniedModal />;
  }
  
  if (user && !user.isApproved) {
    return <PendingApprovalModal />;
  }'''

content = content.replace(old_access, new_access)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
