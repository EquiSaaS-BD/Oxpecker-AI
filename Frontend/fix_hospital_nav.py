import re

filepath = 'src/components/hospital/HospitalHeader.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if 'EmergencyPatientLookupModal' not in content:
    content = content.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport { EmergencyPatientLookupModal } from "@/components/doctor/EmergencyPatientLookupModal";')
    
if 'ShieldAlert' not in content:
    content = content.replace('ChevronDown,\n} from "lucide-react";', 'ChevronDown,\n  ShieldAlert,\n} from "lucide-react";')

# Add state
if 'showEmergencyModal' not in content:
    content = content.replace('const [searchQuery, setSearchQuery] = useState("");', 'const [searchQuery, setSearchQuery] = useState("");\n  const [showEmergencyModal, setShowEmergencyModal] = useState(false);')

# Replace button
old_button = '''<button
            onClick={() => toast.info("Allocate Bed Feature Coming Soon")}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
          >
            <BedDouble size={14} />
            Allocate Bed
          </button>'''

new_button = '''<button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-2 text-[13px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <ShieldAlert size={16} />
            Emergency Lookup
          </button>'''

content = content.replace(old_button, new_button)

# Add Modal at the end of header
old_end = '</header>'
new_end = '''  <EmergencyPatientLookupModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        hospitalName={user?.name || "Hospital Emergency Unit"}
      />
    </header>'''

content = content.replace(old_end, new_end)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
