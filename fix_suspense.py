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
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/transaction-logs/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/transaction-logs/failed-transactions/page.tsx',
  'c:/Users/rarsh/Documents/CodeLab/blaffa_pay/app/dashboard/wave-business-transaction/page.tsx'
]

for file in files:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # remove export const dynamic = 'force-dynamic';
    content = content.replace("export const dynamic = 'force-dynamic';", "")
    
    # Check if already wrapped
    if 'Suspense fallback=' in content: continue
    
    # We want to change `export default function XYZ() {`
    # to `function XYZContent() {`
    # and then at the very bottom add:
    # export default function XYZ() { return <Suspense fallback={<div>Chargement...</div>}><XYZContent /></Suspense>; }
    
    comp_match = re.search(r'export default function (\w+)\s*\(\)\s*\{', content)
    if not comp_match: continue
    comp_name = comp_match.group(1)
    
    content = content.replace(comp_match.group(0), f'function {comp_name}Content() {{')
    
    wrapper = f"""

import {{ Suspense }} from 'react'

export default function {comp_name}() {{
  return (
    <Suspense fallback={{<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}}>
      <{comp_name}Content />
    </Suspense>
  )
}}
"""
    # Just append to the end or replace
    content += wrapper
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Wrapped {file} in Suspense")
