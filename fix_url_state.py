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
    if not os.path.exists(file):
        print(f"Skipping {file}, not found")
        continue

    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Add imports if missing
    if 'import { useRouter' not in content:
        content = content.replace('"use client"', '"use client"\nimport { useRouter, useSearchParams, usePathname } from "next/navigation"')

    # 2. Extract component name
    comp_match = re.search(r'export default function (\w+)\s*\(\)\s*\{', content)
    if not comp_match:
        print(f"Component name not found in {file}")
        continue
        
    comp_name = comp_match.group(1)
    print(f"Processing {comp_name} in {file}")
    
    # 3. Add router instances
    if 'const searchParams = useSearchParams()' not in content:
        content = content.replace(f'export default function {comp_name}() {{', f'export default function {comp_name}() {{\n  const router = useRouter()\n  const pathname = usePathname()\n  const searchParams = useSearchParams()')

    # 4. update useState to read from URL
    def replace_state(match, param_name):
        default_val = match.group(1)
        if 'searchParams.get' in default_val:
            return match.group(0) # already has it
        inner = f'searchParams.get("{param_name}") || {default_val}'
        if param_name == 'page':
            inner = f'Number(searchParams.get("page")) || {default_val}'
        return match.group(0).replace(f'useState({default_val})', f'useState({inner})')

    content = re.sub(r'const\s+\[searchTerm,\s*setSearchTerm\]\s*=\s*useState\(([^)]*)\)', lambda m: replace_state(m, 'search'), content)
    content = re.sub(r'const\s+\[searchInput,\s*setSearchInput\]\s*=\s*useState\(([^)]*)\)', lambda m: replace_state(m, 'search'), content)
    content = re.sub(r'const\s+\[typeFilter,\s*setTypeFilter\]\s*=\s*useState\(([^)]*)\)', lambda m: replace_state(m, 'sms_type'), content)
    content = re.sub(r'const\s+\[deviceFilter,\s*setDeviceFilter\]\s*=\s*useState\(([^)]*)\)', lambda m: replace_state(m, 'device_id'), content)
    content = re.sub(r'const\s+\[statusFilter,\s*setStatusFilter\]\s*=\s*useState\(([^)]*)\)', lambda m: replace_state(m, 'status'), content)
    content = re.sub(r'const\s+\[currentPage,\s*setCurrentPage\]\s*=\s*useState\(([^)]*)\)', lambda m: replace_state(m, 'page'), content)
    content = re.sub(r'const\s+\[startDate,\s*setStartDate\]\s*=\s*useState\s*<\s*string\s*\|\s*null\s*>\(([^)]*)\)', lambda m: replace_state(m, 'start_date'), content)
    content = re.sub(r'const\s+\[endDate,\s*setEndDate\]\s*=\s*useState\s*<\s*string\s*\|\s*null\s*>\(([^)]*)\)', lambda m: replace_state(m, 'end_date'), content)

    # 5. Inject updateUrl and handlePageChange
    if 'const handlePageChange' not in content:
        handler_code = """
  // Centralized URL update function
  const updateUrl = useCallback((newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all" || (key === "page" && value === 1)) {
        params.delete(key)
      } else {
        params.set(key, value.toString())
      }
    })
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateUrl({ page })
  }
"""
        content = content.replace('const searchParams = useSearchParams()', f'const searchParams = useSearchParams()\n{handler_code}')
        
        if 'useCallback' not in content:
            # find import react and inject
            react_import_match = re.search(r'import\s+\{([^}]*)\}\s+from\s+["\']react["\']', content)
            if react_import_match:
                new_imports = react_import_match.group(1) + ', useCallback'
                content = content.replace(react_import_match.group(0), f'import {{{new_imports}}} from "react"')
            else:
                content = content.replace('"use client"', '"use client"\nimport { useCallback } from "react"')

    if content != original_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified {file}")
