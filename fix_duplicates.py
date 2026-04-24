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
    
    # We injected `const router = useRouter()` at the top. Let's find any subsequent `const router = useRouter()` and remove them.
    # We can just check the count.
    router_occurrences = list(re.finditer(r'\bconst\s+router\s*=\s*useRouter\(\)', content))
    if len(router_occurrences) > 1:
        # keep the first one, remove the rest
        # since we want to remove exactly the duplicates, let's replace all except first
        first_pos = router_occurrences[0].start()
        
        # Replace subsequent ones
        def replace_dup(match):
            if match.start() == first_pos:
                return match.group(0)
            return "" # remove it
        
        content = re.sub(r'\bconst\s+router\s*=\s*useRouter\(\)', replace_dup, content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Removed duplicate router in {file}")

    # let's be safe and check if router was somehow removed completely
    if 'useRouter()' not in content:
        print(f"WARNING: No router in {file}")
