# Betting System Integration - Quick Checklist

## Files to Copy

### Core Utilities (Required)
- [ ] `lib/useApi.ts` - API hook with auth
- [ ] `lib/api.ts` - Token management
- [ ] `components/ui/error-display.tsx` - Error component
- [ ] `components/ui/date-range-filter.tsx` - Date filter

### UI Components (Required)
- [ ] `components/ui/card.tsx`
- [ ] `components/ui/input.tsx`
- [ ] `components/ui/button.tsx`
- [ ] `components/ui/badge.tsx`
- [ ] `components/ui/select.tsx`
- [ ] `components/ui/table.tsx`
- [ ] `components/ui/dialog.tsx`
- [ ] `components/ui/label.tsx`
- [ ] `components/ui/textarea.tsx`
- [ ] `components/ui/switch.tsx`
- [ ] `components/ui/dropdown-menu.tsx`

### Betting Pages (Copy Entire Directories)
- [ ] `app/dashboard/platforms/` (all files)
- [ ] `app/dashboard/permissions/` (all files)
- [ ] `app/dashboard/betting-transactions/` (all files)
- [ ] `app/dashboard/partner-transfers/` (all files)
- [ ] `app/dashboard/partner-permissions-summary/` (all files)
- [ ] `app/dashboard/api-config/` (all files)

### Partner Page Updates
- [ ] Update `app/dashboard/partner/page.tsx` with betting commission modals
  - Line 13: Import `MoreHorizontal`, `TrendingUp`, `ArrowUpDownIcon`, `Wallet` from lucide-react
  - Line 22: Import `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`
  - Lines 66-83: Betting commission states
  - Lines 191-237: `handleOpenBettingCommission()`
  - Lines 239-282: `handleSaveBettingCommission()`
  - Lines 284-324: `handlePayBettingCommission()`
  - **Lines 642-682: MoreHorizontal dropdown menu in Actions column** ⚠️ **Critical for betting access**
    - Commissions Paris menu item
    - Transferts menu item
    - Payer Commission menu item
  - Lines 946-1208: Betting Commission Modal
  - Lines 1210-1276: Commission Payment Modal

### Navigation
- [ ] Update `components/layout/sidebar.tsx` with betting menu items
  - Platforms dropdown
  - Permissions dropdown
  - Betting Transactions link
  - Partner Transfers link
  - Partner Permissions Summary link
  - API Config link

## Dependencies to Install

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
            @radix-ui/react-select @radix-ui/react-label \
            lucide-react react-hook-form zod date-fns
```

## Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=your-api-url
```

## API Endpoints Required

### Platforms
- GET `/api/payments/betting/admin/platforms/`
- POST `/api/payments/betting/admin/platforms/`
- GET `/api/payments/betting/admin/platforms/{uid}/`
- PATCH `/api/payments/betting/admin/platforms/{uid}/`
- DELETE `/api/payments/betting/admin/platforms/{uid}/`
- POST `/api/payments/betting/admin/platforms/{uid}/toggle_status/`
- GET `/api/payments/betting/admin/platforms/{uid}/stats/`

### Permissions
- GET `/api/payments/betting/admin/permissions/`
- POST `/api/payments/betting/admin/permissions/`
- PATCH `/api/payments/betting/admin/permissions/{uid}/`
- GET `/api/payments/betting/admin/permissions/user_platforms/?user_uid={uid}`
- GET `/api/payments/betting/admin/permissions/user_platforms_summary/`

### Transactions
- GET `/api/payments/betting/admin/transactions/`
- GET `/api/payments/betting/admin/transactions/{uid}/`
- POST `/api/payments/betting/admin/transactions/{uid}/process_cancellation/`
- GET `/api/payments/betting/admin/transactions/stats/`

### Commissions
- GET `/api/payments/betting/admin/commission-configs/get_partner_config/?partner_uid={uid}`
- POST `/api/payments/betting/admin/commission-configs/`
- PATCH `/api/payments/betting/admin/commission-configs/{uid}/`
- POST `/api/payments/betting/admin/commissions/pay_commissions/`
- GET `/api/payments/betting/admin/commissions/partner_commission_stats/?partner_uid={uid}`

### Partner Transfers
- GET `/api/payments/betting/admin/partner-transfers/`
- GET `/api/payments/betting/admin/partner-transfers/by_partner/?partner_uid={uid}`
- GET `/api/payments/betting/admin/partner-transfers/statistics/`

### API Config
- GET `/api/payments/betting/admin/api-config/`
- POST `/api/payments/betting/admin/api-config/`
- PATCH `/api/payments/betting/admin/api-config/{uid}/`

## Testing After Integration

### Platforms
- [ ] List platforms
- [ ] Create platform
- [ ] Edit platform
- [ ] View platform details
- [ ] Toggle platform status
- [ ] Delete platform

### Permissions
- [ ] List permissions
- [ ] Create permission
- [ ] Edit permission
- [ ] View user platform permissions

### Transactions
- [ ] List transactions
- [ ] Filter transactions (status, type, platform, commission)
- [ ] View transaction details
- [ ] Cancel transaction
- [ ] View transaction stats

### Commissions
- [ ] View partner commission config
- [ ] Create/update commission config
- [ ] Pay commissions
- [ ] View commission stats

### Partner Transfers
- [ ] List all transfers
- [ ] Filter transfers
- [ ] View partner-specific transfers
- [ ] View transfer statistics

## Common Issues to Check

- [ ] Authentication tokens are stored and sent correctly
- [ ] Token refresh endpoint works (`POST /api/auth/token/refresh/`)
- [ ] CORS is configured on backend
- [ ] API base URL is correct
- [ ] All UI components render correctly
- [ ] Dark mode works
- [ ] Mobile responsive design works
- [ ] Pagination works
- [ ] Filtering and sorting work
- [ ] Date range filter works

