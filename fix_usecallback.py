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
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/api-config/page.tsx'
]

for file in files:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # check if useCallback is imported
    # It might be in import { useCallback } from "react"
    # Or import { useEffect, useState, useMemo } from "react"
    
    import_match = re.search(r'import\s+\{([^}]*)\}\s+from\s+["\']react["\']', content)
    if import_match:
        imports_str = import_match.group(1)
        if 'useCallback' not in imports_str:
            new_imports = imports_str + ', useCallback'
            content = content.replace(import_match.group(0), f'import {{{new_imports}}} from "react"')
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added useCallback to {file}")
    else:
        # add a new import at the top after use client
        if 'useCallback' not in content[:500]: # check top of file
            content = content.replace('"use client"', '"use client"\nimport { useCallback } from "react"')
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added fresh useCallback to {file}")
