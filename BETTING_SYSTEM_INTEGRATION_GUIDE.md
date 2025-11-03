# Betting System Integration Guide

This guide explains how to add the complete betting system from this application to another application, including all endpoints, pages, and integrations.

## Table of Contents

1. [System Overview](#system-overview)
2. [API Endpoints](#api-endpoints)
3. [Frontend Pages/Components](#frontend-pagescomponents)
4. [Dependencies](#dependencies)
5. [File Structure](#file-structure)
6. [Step-by-Step Integration](#step-by-step-integration)
7. [Configuration](#configuration)

---

## System Overview

The betting system includes:
- **Platform Management**: CRUD operations for betting platforms
- **Permission Management**: Grant partners permissions to process betting transactions
- **Transaction Management**: View, filter, and manage betting transactions
- **Commission System**: Configure and pay commissions to partners
- **Partner Transfers**: Track transfers between partners
- **Partner Permissions Summary**: Overview of partner permissions across platforms

---

## API Endpoints

### Base URL
All endpoints use the base path: `/api/payments/betting/admin/`

### 1. Platforms Endpoints

```
GET    /api/payments/betting/admin/platforms/
POST   /api/payments/betting/admin/platforms/
GET    /api/payments/betting/admin/platforms/{uid}/
PATCH  /api/payments/betting/admin/platforms/{uid}/
DELETE /api/payments/betting/admin/platforms/{uid}/
POST   /api/payments/betting/admin/platforms/{uid}/toggle_status/
GET    /api/payments/betting/admin/platforms/{uid}/stats/
```

**Platform Model:**
```typescript
{
  uid: string;
  name: string;
  external_id: string;
  logo: string | null;
  is_active: boolean;
  min_deposit_amount: string;
  max_deposit_amount: string;
  min_withdrawal_amount: string;
  max_withdrawal_amount: string;
  description: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  active_partners_count: number;
  total_transactions_count: number;
}
```

### 2. Permissions Endpoints

```
GET    /api/payments/betting/admin/permissions/
POST   /api/payments/betting/admin/permissions/
GET    /api/payments/betting/admin/permissions/{uid}/
PATCH  /api/payments/betting/admin/permissions/{uid}/
GET    /api/payments/betting/admin/permissions/user_platforms/?user_uid={uid}
GET    /api/payments/betting/admin/permissions/user_platforms_summary/
```

**Permission Model:**
```typescript
{
  uid: string;
  partner: string;
  partner_name: string;
  platform: string;
  platform_name: string;
  platform_external_id: string;
  can_deposit: boolean;
  can_withdraw: boolean;
  is_active: boolean;
  granted_by: number;
  granted_by_name: string;
  created_at: string;
  updated_at: string;
}
```

### 3. Transactions Endpoints

```
GET    /api/payments/betting/admin/transactions/
GET    /api/payments/betting/admin/transactions/{uid}/
POST   /api/payments/betting/admin/transactions/{uid}/process_cancellation/
GET    /api/payments/betting/admin/transactions/stats/
```

**Transaction Model:**
```typescript
{
  uid: string;
  reference: string;
  partner_name: string;
  platform_name: string;
  transaction_type: "deposit" | "withdrawal";
  amount: string;
  status: string;
  commission_amount: string;
  commission_paid: boolean;
  created_at: string;
}
```

### 4. Commission Configuration Endpoints

```
GET    /api/payments/betting/admin/commission-configs/
POST   /api/payments/betting/admin/commission-configs/
GET    /api/payments/betting/admin/commission-configs/{uid}/
PATCH  /api/payments/betting/admin/commission-configs/{uid}/
GET    /api/payments/betting/admin/commission-configs/get_partner_config/?partner_uid={uid}
```

**Commission Config Model:**
```typescript
{
  uid: string;
  partner: string;
  deposit_commission_rate: string;
  withdrawal_commission_rate: string;
  updated_by: number;
  updated_by_name: string;
  updated_at: string;
}
```

### 5. Commission Payment Endpoints

```
POST   /api/payments/betting/admin/commissions/pay_commissions/
GET    /api/payments/betting/admin/commissions/partner_commission_stats/?partner_uid={uid}
```

**Commission Payment Payload:**
```typescript
{
  partner_uid: string;
  transaction_ids: string[] | null; // null = pay all unpaid
  admin_notes: string;
}
```

### 6. Partner Transfers Endpoints

```
GET    /api/payments/betting/admin/partner-transfers/
GET    /api/payments/betting/admin/partner-transfers/by_partner/?partner_uid={uid}
GET    /api/payments/betting/admin/partner-transfers/statistics/
```

### 7. API Config Endpoints

```
GET    /api/payments/betting/admin/api-config/
POST   /api/payments/betting/admin/api-config/
GET    /api/payments/betting/admin/api-config/{uid}/
PATCH  /api/payments/betting/admin/api-config/{uid}/
```

---

## Frontend Pages/Components

### Required Pages Structure

```
app/dashboard/
├── platforms/
│   ├── list/page.tsx              # List all platforms
│   ├── create/page.tsx            # Create new platform
│   ├── edit/[id]/page.tsx         # Edit platform
│   └── details/[id]/page.tsx      # Platform details & stats
├── permissions/
│   ├── list/page.tsx              # List all permissions
│   ├── create/page.tsx           # Grant new permission
│   └── platforms/[uid]/page.tsx   # User platform permissions
├── betting-transactions/
│   ├── page.tsx                   # List betting transactions
│   └── [uid]/page.tsx             # Transaction details
├── partner-transfers/
│   └── page.tsx                   # Partner transfers list
├── partner-permissions-summary/
│   ├── page.tsx                   # Summary list
│   └── [user_uid]/page.tsx        # User detailed summary
├── api-config/
│   └── page.tsx                   # API configuration
└── partner/
    └── page.tsx                   # Partner management (with betting commission modals)
```

### Key Components Used

All pages use these shared components from `@/components/ui/`:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Input`
- `Button`
- `Badge`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `ErrorDisplay`
- `DateRangeFilter`
- `Label`
- `Textarea`
- `Switch`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`

### MoreHorizontal Dropdown Menu in Partner Page

**IMPORTANT**: The partner page uses a **MoreHorizontal** (three horizontal dots) dropdown menu in the Actions column of the partner table. This provides quick access to betting-related actions.

**Location**: `app/dashboard/partner/page.tsx` (Lines 642-682)

**Required Imports**:
```typescript
import { MoreHorizontal, TrendingUp, ArrowUpDownIcon, Wallet, DollarSign } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
```

**Complete Implementation** (from Partner page table Actions column):
```typescript
<TableCell>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
        <span className="sr-only">Ouvrir le menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      {/* Non-betting action */}
      <DropdownMenuItem asChild>
        <Link href={`/dashboard/partner/commission/${partner.uid}`} className="flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
          <span>Commission momo</span>
        </Link>
      </DropdownMenuItem>
      
      {/* Betting Commission Configuration */}
      <DropdownMenuItem onClick={() => handleOpenBettingCommission(partner)}>
        <TrendingUp className="h-4 w-4 mr-2 text-orange-600" />
        <span>Commissions Paris</span>
      </DropdownMenuItem>
      
      {/* Betting Partner Transfers */}
      <DropdownMenuItem onClick={() => handleOpenTransfers(partner)}>
        <ArrowUpDownIcon className="h-4 w-4 mr-2 text-blue-600" />
        <span>Transferts</span>
      </DropdownMenuItem>
      
      {/* Betting Commission Payment */}
      <DropdownMenuItem onClick={() => {
        setBettingCommissionPartner(partner)
        setBettingCommissionPaymentModalOpen(true)
      }}>
        <Wallet className="h-4 w-4 mr-2 text-emerald-600" />
        <span>Payer Commission</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

**Betting-Related Actions in Menu**:
1. **Commissions Paris** - Opens betting commission configuration modal (`handleOpenBettingCommission`)
2. **Transferts** - Opens partner transfers modal (`handleOpenTransfers`) - shows betting transfers
3. **Payer Commission** - Opens commission payment modal - pays betting commissions

**Required Component**: 
- `components/ui/dropdown-menu.tsx` (from `@radix-ui/react-dropdown-menu` package)

**Note**: This dropdown menu is a critical UI pattern that provides easy access to all betting-related partner management features directly from the partner list table.

### Key Hooks/Custom Hooks

- `useApi()` from `@/lib/useApi` - Authenticated API fetching with token refresh
- `useToast()` from `@/hooks/use-toast` - Toast notifications
- `useLanguage()` from `@/components/providers/language-provider` - Internationalization

---

## Dependencies

### Required npm Packages

```json
{
  "@radix-ui/react-dialog": "1.1.4",
  "@radix-ui/react-dropdown-menu": "2.1.4",
  "@radix-ui/react-select": "2.1.4",
  "@radix-ui/react-label": "2.1.1",
  "lucide-react": "^0.454.0",
  "next": "14.2.16",
  "react": "^18",
  "react-dom": "^18",
  "react-hook-form": "^7.54.1",
  "zod": "^3.24.1",
  "date-fns": "4.1.0",
  "tailwindcss": "^3.4.17"
}
```

### Required Utility Files

1. **`lib/useApi.ts`** - Custom hook for authenticated API calls
2. **`lib/api.ts`** - Token management helpers
3. **`components/ui/*`** - UI component library (shadcn/ui style)
4. **`components/ui/error-display.tsx`** - Error display component
5. **`components/ui/date-range-filter.tsx`** - Date range filter component

---

## File Structure

### Complete Directory Structure Needed

```
your-app/
├── app/
│   └── dashboard/
│       ├── platforms/
│       ├── permissions/
│       ├── betting-transactions/
│       ├── partner-transfers/
│       ├── partner-permissions-summary/
│       ├── api-config/
│       └── partner/
├── components/
│   ├── ui/          # All shadcn/ui components
│   └── layout/
│       └── sidebar.tsx  # Navigation sidebar
├── lib/
│   ├── useApi.ts    # API hook
│   └── api.ts       # Token helpers
├── hooks/
│   └── use-toast.ts # Toast hook
└── .env.local       # Environment variables
```

---

## Step-by-Step Integration

### Step 1: Install Dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select \
            @radix-ui/react-label lucide-react react-hook-form zod date-fns
```

### Step 2: Copy Core Utility Files

Copy these files to your new app:

1. **`lib/useApi.ts`** - Handles authenticated API calls with token refresh
2. **`lib/api.ts`** - Token management (getAccessToken, setTokens, etc.)
3. **`components/ui/error-display.tsx`** - Error display component
4. **`components/ui/date-range-filter.tsx`** - Date filter component

### Step 3: Copy UI Components

Copy all required UI components from `components/ui/`:
- card.tsx
- input.tsx
- button.tsx
- badge.tsx
- select.tsx
- table.tsx
- dialog.tsx
- label.tsx
- textarea.tsx
- switch.tsx
- dropdown-menu.tsx

### Step 4: Copy Betting Pages

Copy these directories to your `app/dashboard/` folder:

```bash
# From source app
cp -r app/dashboard/platforms your-app/app/dashboard/
cp -r app/dashboard/permissions your-app/app/dashboard/
cp -r app/dashboard/betting-transactions your-app/app/dashboard/
cp -r app/dashboard/partner-transfers your-app/app/dashboard/
cp -r app/dashboard/partner-permissions-summary your-app/app/dashboard/
cp -r app/dashboard/api-config your-app/app/dashboard/
```

And update the partner page:
```bash
cp app/dashboard/partner/page.tsx your-app/app/dashboard/partner/
```

### Step 5: Update Navigation

Update your sidebar navigation (`components/layout/sidebar.tsx`) to include:

```typescript
// Add these menu items:
- Plateformes (Platforms)
  - Liste des Plateformes (/dashboard/platforms/list)
  - Créer Plateforme (/dashboard/platforms/create)
- Permissions
  - Liste des Permissions (/dashboard/permissions/list)
  - Accorder Permission (/dashboard/permissions/create)
- Transactions Paris (/dashboard/betting-transactions)
- Transferts Partenaires (/dashboard/partner-transfers)
- Résumé Permissions (/dashboard/partner-permissions-summary)
- Configuration API (/dashboard/api-config)
```

### Step 6: Update Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
```

### Step 7: Update Partner Page

The partner page (`app/dashboard/partner/page.tsx`) contains betting commission modals. Ensure these functions are present:

- `handleOpenBettingCommission()` - Opens commission configuration modal
- `handleSaveBettingCommission()` - Saves commission config
- `handlePayBettingCommission()` - Pays commission to partner

---

## Configuration

### API Base URL

Set in environment variables:
```bash
NEXT_PUBLIC_API_BASE_URL=your-api-base-url
```

### Authentication

The system uses JWT tokens stored in localStorage:
- `accessToken` - Short-lived access token
- `refreshToken` - Long-lived refresh token

The `useApi()` hook automatically:
- Attaches the Bearer token to requests
- Refreshes tokens when expired
- Handles 401 errors and redirects to login

### Pagination

Default pagination settings:
- `itemsPerPage: 20`
- Query params: `page`, `page_size`

### Filtering & Sorting

All list pages support:
- Search by text
- Status filtering
- Date range filtering
- Multi-column sorting
- Platform-specific filtering

---

## Key Integration Points

### 1. API Authentication

Ensure your backend expects:
```
Authorization: Bearer {accessToken}
```

### 2. Token Refresh Endpoint

Must implement:
```
POST /api/auth/token/refresh/
Body: { "refresh": "refresh_token_string" }
Response: { "access": "new_access_token" }
```

### 3. Error Handling

All API errors are caught and displayed using `ErrorDisplay` component, which handles:
- `non_field_errors`
- Field-specific errors
- Network errors

### 4. Toast Notifications

Use `useToast()` hook for user feedback:
```typescript
const { toast } = useToast()
toast({ 
  title: "Success", 
  description: "Operation completed" 
})
```

---

## Testing Checklist

After integration, test:

- [ ] Platform CRUD operations
- [ ] Permission creation and management
- [ ] Transaction listing and filtering
- [ ] Commission configuration saving
- [ ] Commission payment processing
- [ ] Partner transfers viewing
- [ ] Permission summaries
- [ ] Date range filtering
- [ ] Search functionality
- [ ] Pagination
- [ ] Sorting
- [ ] Token refresh on expiration

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Check that tokens are being stored and sent correctly. Verify token refresh endpoint works.

### Issue: CORS Errors
**Solution**: Ensure backend allows requests from your frontend domain.

### Issue: Components Not Rendering
**Solution**: Verify all shadcn/ui components are installed and Tailwind CSS is configured.

### Issue: API Calls Failing
**Solution**: Check `NEXT_PUBLIC_API_BASE_URL` is set correctly and API endpoints match.

---

## Additional Notes

1. **TypeScript Types**: All pages use TypeScript interfaces for type safety. Copy the interfaces from source files.

2. **Styling**: Uses Tailwind CSS with custom color scheme matching brand colors.

3. **Internationalization**: Uses `useLanguage()` hook. Update translations as needed for your app.

4. **Responsive Design**: All pages are mobile-responsive using Tailwind breakpoints.

5. **Dark Mode**: All components support dark mode via `dark:` Tailwind classes.

---

## Support

For questions or issues:
1. Check API endpoint responses match expected models
2. Verify authentication flow
3. Check browser console for errors
4. Verify network requests in DevTools

---

**Last Updated**: Based on blaffa_pay betting system as of integration date.

