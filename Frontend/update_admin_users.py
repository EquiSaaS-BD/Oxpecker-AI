import os

filepath = 'src/app/(app)/admin/users/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Change activeTab type
content = content.replace(
    'const [activeTab, setActiveTab] = useState<"all" | "patient" | "doctor" | "hospital" | "assistant" | "admin">("all");',
    'const [activeTab, setActiveTab] = useState<"all" | "patient" | "doctor" | "hospital" | "assistant" | "admin" | "pending">("all");'
)

# Change filteredUsers
old_filter = '''  const filteredUsers = users
    .filter(u => activeTab === "all" || u.role === activeTab)'''

new_filter = '''  const filteredUsers = users
    .filter(u => activeTab === "all" ? true : activeTab === "pending" ? u.status === "pending" : u.role === activeTab)'''

content = content.replace(old_filter, new_filter)

# Change the tabs UI
old_tabs_ui = '''{(["all", "admin", "patient", "doctor", "hospital", "assistant"] as const).map(tab => ('''
new_tabs_ui = '''{(["all", "pending", "admin", "patient", "doctor", "hospital", "assistant"] as const).map(tab => ('''
content = content.replace(old_tabs_ui, new_tabs_ui)

old_tabs_len = '''{tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === "all" ? users.length : users.filter(u => u.role === tab).length})'''
new_tabs_len = '''{tab === "pending" ? "Pending Approvals" : tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === "all" ? users.length : tab === "pending" ? users.filter(u => u.status === "pending").length : users.filter(u => u.role === tab).length})'''
content = content.replace(old_tabs_len, new_tabs_len)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
