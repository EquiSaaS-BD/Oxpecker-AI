import os
import re

def convert_html_to_jsx(html_content, component_name):
    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL | re.IGNORECASE)
    if body_match:
        content = body_match.group(1)
    else:
        content = html_content

    # Replace class with className
    content = content.replace('class="', 'className="')
    
    # Replace for with htmlFor
    content = content.replace('for="', 'htmlFor="')
    
    # Fix self-closing tags
    tags_to_close = ['img', 'input', 'br', 'hr', 'source', 'link', 'meta']
    for tag in tags_to_close:
        # Match <tag ... > but not <tag ... />
        content = re.sub(rf'<({tag})\b([^>]*?)(?<!/)>', r'<\1\2 />', content, flags=re.IGNORECASE)

    # Convert common SVG attributes
    attr_map = {
        'stroke-width': 'strokeWidth',
        'stroke-linecap': 'strokeLinecap',
        'stroke-linejoin': 'strokeLinejoin',
        'fill-rule': 'fillRule',
        'clip-rule': 'clipRule',
        'stroke-dasharray': 'strokeDasharray',
        'stroke-miterlimit': 'strokeMiterlimit',
        'clip-path': 'clipPath',
        'fill-opacity': 'fillOpacity',
        'stop-color': 'stopColor',
        'stop-opacity': 'stopOpacity'
    }
    
    for old_attr, new_attr in attr_map.items():
        content = content.replace(f'{old_attr}=', f'{new_attr}=')
        
    # Replace tabindex
    content = content.replace('tabindex=', 'tabIndex=')
    
    # Replace HTML comments
    content = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', content, flags=re.DOTALL)
    
    # Replace style string with simple placeholder or convert it (for simple cases)
    # This is a bit tricky, we'll try to convert simple inline styles
    def style_replacer(match):
        style_str = match.group(1)
        # simplistic conversion
        rules = [r.strip() for r in style_str.split(';') if r.strip()]
        react_styles = []
        for r in rules:
            if ':' in r:
                k, v = r.split(':', 1)
                k = k.strip()
                v = v.strip().replace("'", '"')
                # camelCase key
                parts = k.split('-')
                k_camel = parts[0] + ''.join(p.capitalize() for p in parts[1:])
                react_styles.append(f'{k_camel}: "{v}"')
        return 'style={{' + ', '.join(react_styles) + '}}'
        
    content = re.sub(r'style="([^"]*)"', style_replacer, content)

    # Wrap in component
    jsx_template = f"""export default function {component_name}() {{
  return (
    <>
{content}
    </>
  );
}}
"""
    return jsx_template

pages = [
    {
        "source": "../fontent_zip_file/Starting_page/starting_page.zip/shustota_professional_multi_step_registration/code.html",
        "dest": "src/app/(auth)/register/step-1/page.tsx",
        "name": "RegisterStep1Page"
    },
    {
        "source": "../fontent_zip_file/Starting_page/starting_page.zip/shustota_registration_step_2_personal_info/code.html",
        "dest": "src/app/(auth)/register/step-2/page.tsx",
        "name": "RegisterStep2Page"
    },
    {
        "source": "../fontent_zip_file/Starting_page/starting_page.zip/shustota_registration_step_3_security/code.html",
        "dest": "src/app/(auth)/register/step-3/page.tsx",
        "name": "RegisterStep3Page"
    },
    {
        "source": "../fontent_zip_file/Starting_page/starting_page.zip/shustota_verified_patient_profile_dashboard/code.html",
        "dest": "src/app/(app)/patient/profile/page.tsx",
        "name": "PatientProfilePage"
    },
    {
        "source": "../fontent_zip_file/Starting_page/starting_page.zip/shustota_professional_doctor_profile_management_settings/code.html",
        "dest": "src/app/(app)/doctor/settings/page.tsx",
        "name": "DoctorSettingsPage"
    },
    {
        "source": "../fontent_zip_file/Starting_page/starting_page.zip/shustota_advanced_hospital_admin_analytics_dashboard/code.html",
        "dest": "src/app/(app)/admin/dashboard/page.tsx",
        "name": "AdminDashboardPage"
    }
]

for page in pages:
    with open(page["source"], "r", encoding="utf-8") as f:
        html = f.read()
    
    jsx = convert_html_to_jsx(html, page["name"])
    
    # ensure directory exists
    os.makedirs(os.path.dirname(page["dest"]), exist_ok=True)
    
    with open(page["dest"], "w", encoding="utf-8") as f:
        f.write(jsx)
    
    print(f"Created {page['dest']}")
