import os
import re

files = [
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/sms-logs/list/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/platforms/list/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/partner-transfers/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/partner-permissions-summary/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/permissions/list/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/fcm-logs/list/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/earning-management/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/api-config/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/partner/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/users/list/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/transaction-logs/page.tsx'
]

for file in files:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to ensure that "next/navigation" imports `useRouter`, `useSearchParams`, and `usePathname`
    match = re.search(r'import\s+\{([^}]*)\}\s+from\s+["\']next/navigation["\']', content)
    if match:
        imports_str = match.group(1)
        needed = []
        if 'useRouter' not in imports_str: needed.append('useRouter')
        if 'useSearchParams' not in imports_str: needed.append('useSearchParams')
        if 'usePathname' not in imports_str: needed.append('usePathname')
        
        if needed:
            new_imports = imports_str.strip()
            if new_imports and not new_imports.endswith(','):
                new_imports += ', '
            new_imports += ', '.join(needed)
            
            content = content.replace(match.group(0), f'import {{ {new_imports} }} from "next/navigation"')
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed next/navigation imports in {file}")
