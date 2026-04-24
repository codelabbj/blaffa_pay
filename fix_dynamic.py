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
    
    if 'export const dynamic' not in content:
        # inject after the last import
        import_blocks = list(re.finditer(r'^import\s+.*$', content, re.MULTILINE))
        if import_blocks:
            last_import = import_blocks[-1]
            insert_pos = last_import.end()
            new_content = content[:insert_pos] + "\n\nexport const dynamic = 'force-dynamic';\n" + content[insert_pos:]
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Added force-dynamic to {file}")
