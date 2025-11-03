# Betting Commission Modal - Complete Implementation Guide

This guide provides complete information about the betting commission modal implementation, including all states, handlers, API endpoints, and UI components.

## Table of Contents

1. [Overview](#overview)
2. [State Management](#state-management)
3. [Handler Functions](#handler-functions)
4. [API Endpoints](#api-endpoints)
5. [Modal Structure](#modal-structure)
6. [Data Models](#data-models)
7. [Complete Code Implementation](#complete-code-implementation)

---

## Overview

The Betting Commission Modal is a comprehensive interface for managing partner betting commissions. It allows admins to:
- View partner account balance
- View detailed commission statistics
- Configure commission rates (deposit & withdrawal)
- Pay unpaid commissions
- View current configuration

**Location**: `app/dashboard/partner/page.tsx`

**Trigger**: Click "Commissions Paris" from the MoreHorizontal dropdown menu in partner table

---

## State Management

### Required State Variables

**Location**: Lines 66-83 in `app/dashboard/partner/page.tsx`

```typescript
// Modal open/close state
const [bettingCommissionModalOpen, setBettingCommissionModalOpen] = useState(false)

// Partner being managed
const [bettingCommissionPartner, setBettingCommissionPartner] = useState<any | null>(null)

// Current commission configuration (if exists)
const [bettingCommissionConfig, setBettingCommissionConfig] = useState<any | null>(null)

// Loading state for modal operations
const [bettingCommissionLoading, setBettingCommissionLoading] = useState(false)

// Error state
const [bettingCommissionError, setBettingCommissionError] = useState("")

// Commission rate form values
const [bettingCommissionForm, setBettingCommissionForm] = useState({
  deposit_commission_rate: "",
  withdrawal_commission_rate: "",
})

// Commission statistics
const [bettingCommissionStats, setBettingCommissionStats] = useState<any | null>(null)

// Partner account information
const [partnerAccountInfo, setPartnerAccountInfo] = useState<any | null>(null)

// Payment modal states (separate modal for commission payment)
const [bettingCommissionPaymentModalOpen, setBettingCommissionPaymentModalOpen] = useState(false)
const [bettingCommissionPaymentForm, setBettingCommissionPaymentForm] = useState({
  admin_notes: "",
})
const [bettingCommissionPaymentLoading, setBettingCommissionPaymentLoading] = useState(false)
const [bettingCommissionPaymentError, setBettingCommissionPaymentError] = useState("")
```

---

## Handler Functions

### 1. Open Betting Commission Modal

**Function**: `handleOpenBettingCommission`
**Location**: Lines 191-237

**Purpose**: Opens the modal and fetches partner commission data

```typescript
const handleOpenBettingCommission = async (partner: any) => {
  setBettingCommissionModalOpen(true)
  setBettingCommissionLoading(true)
  setBettingCommissionError("")
  setBettingCommissionPartner(partner)
  setBettingCommissionConfig(null)
  setBettingCommissionStats(null)
  setPartnerAccountInfo(null)
  
  try {
    // Get partner commission config
    const configEndpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commission-configs/get_partner_config/?partner_uid=${partner.uid}`
    const configData = await apiFetch(configEndpoint)
    
    if (configData.success && configData.has_config) {
      setBettingCommissionConfig(configData.config)
      setPartnerAccountInfo(configData.account)
      setBettingCommissionForm({
        deposit_commission_rate: configData.config.deposit_commission_rate,
        withdrawal_commission_rate: configData.config.withdrawal_commission_rate,
      })
    } else {
      // Default values if no config exists
      setBettingCommissionForm({
        deposit_commission_rate: "2.00",
        withdrawal_commission_rate: "3.00",
      })
    }
    
    // Store account info even if no config exists
    if (configData.success && configData.account) {
      setPartnerAccountInfo(configData.account)
    }
    
    // Get partner-specific stats
    const statsEndpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commissions/partner_commission_stats/?partner_uid=${partner.uid}`
    const statsData = await apiFetch(statsEndpoint)
    setBettingCommissionStats(statsData)
    
    toast({ title: "Succès", description: "Configuration des commissions de paris chargée" })
  } catch (err: any) {
    setBettingCommissionError(extractErrorMessages(err))
    toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
  } finally {
    setBettingCommissionLoading(false)
  }
}
```

**API Calls**:
1. `GET /api/payments/betting/admin/commission-configs/get_partner_config/?partner_uid={uid}`
2. `GET /api/payments/betting/admin/commissions/partner_commission_stats/?partner_uid={uid}`

### 2. Save Betting Commission Configuration

**Function**: `handleSaveBettingCommission`
**Location**: Lines 239-282

**Purpose**: Creates or updates commission configuration

```typescript
const handleSaveBettingCommission = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!bettingCommissionPartner) return

  setBettingCommissionLoading(true)
  setBettingCommissionError("")
  
  try {
    const payload = {
      partner: bettingCommissionPartner.uid,
      deposit_commission_rate: bettingCommissionForm.deposit_commission_rate,
      withdrawal_commission_rate: bettingCommissionForm.withdrawal_commission_rate,
    }

    let endpoint, method
    if (bettingCommissionConfig) {
      // Update existing config
      endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commission-configs/${bettingCommissionConfig.uid}/`
      method = "PATCH"
    } else {
      // Create new config
      endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commission-configs/`
      method = "POST"
    }

    const data = await apiFetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setBettingCommissionConfig(data)
    toast({ 
      title: "Succès", 
      description: "Configuration des commissions de paris sauvegardée" 
    })
  } catch (err: any) {
    setBettingCommissionError(extractErrorMessages(err))
    toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
  } finally {
    setBettingCommissionLoading(false)
  }
}
```

**API Endpoints**:
- `POST /api/payments/betting/admin/commission-configs/` (create)
- `PATCH /api/payments/betting/admin/commission-configs/{uid}/` (update)

### 3. Pay Betting Commission

**Function**: `handlePayBettingCommission`
**Location**: Lines 284-324

**Purpose**: Pays unpaid commissions to partner

```typescript
const handlePayBettingCommission = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!bettingCommissionPartner) return

  setBettingCommissionPaymentLoading(true)
  setBettingCommissionPaymentError("")
  
  try {
    const payload = {
      partner_uid: bettingCommissionPartner.uid,
      transaction_ids: null, // null = pay all unpaid commissions
      admin_notes: bettingCommissionPaymentForm.admin_notes,
    }

    const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commissions/pay_commissions/`
    const data = await apiFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    toast({ 
      title: "Succès", 
      description: data.message || "Commission de paris payée avec succès" 
    })
    
    setBettingCommissionPaymentModalOpen(false)
    setBettingCommissionPaymentForm({ admin_notes: "" })
    
    // Refresh partner-specific stats
    const statsEndpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commissions/partner_commission_stats/?partner_uid=${bettingCommissionPartner.uid}`
    const statsData = await apiFetch(statsEndpoint)
    setBettingCommissionStats(statsData)
  } catch (err: any) {
    setBettingCommissionPaymentError(extractErrorMessages(err))
    toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
  } finally {
    setBettingCommissionPaymentLoading(false)
  }
}
```

**API Endpoint**: `POST /api/payments/betting/admin/commissions/pay_commissions/`

---

## API Endpoints

### 1. Get Partner Commission Config

```
GET /api/payments/betting/admin/commission-configs/get_partner_config/?partner_uid={uid}
```

**Response**:
```typescript
{
  success: boolean
  has_config: boolean
  config?: {
    uid: string
    partner: string
    deposit_commission_rate: string
    withdrawal_commission_rate: string
    updated_by: number
    updated_by_name: string
    updated_at: string
  }
  account?: {
    balance: string
    formatted_balance: string // e.g., "XOF 1,234.56"
  }
}
```

### 2. Create Commission Config

```
POST /api/payments/betting/admin/commission-configs/
```

**Request Body**:
```typescript
{
  partner: string // partner UID
  deposit_commission_rate: string // percentage as string
  withdrawal_commission_rate: string // percentage as string
}
```

**Response**: Commission config object

### 3. Update Commission Config

```
PATCH /api/payments/betting/admin/commission-configs/{uid}/
```

**Request Body**: Same as create (all fields optional)

**Response**: Updated commission config object

### 4. Get Partner Commission Stats

```
GET /api/payments/betting/admin/commissions/partner_commission_stats/?partner_uid={uid}
```

**Response**:
```typescript
{
  commissions: {
    total_transaction_count: number
    total_earned: string // total commission earned
    total_paid: string // total commission paid
    total_unpaid: string // total commission unpaid
    payable: string // currently payable amount
    payable_count: number // number of transactions with payable commissions
    current_month: string // current month commission
    current_month_count: number // current month transaction count
  }
}
```

### 5. Pay Commissions

```
POST /api/payments/betting/admin/commissions/pay_commissions/
```

**Request Body**:
```typescript
{
  partner_uid: string
  transaction_ids: string[] | null // null = pay all unpaid
  admin_notes: string
}
```

**Response**:
```typescript
{
  message: string
  // ... other payment details
}
```

---

## Modal Structure

### Main Modal Components

**Location**: Lines 946-1208

The modal contains these sections (in order):

1. **Partner Balance Card** (Lines 964-980)
   - Shows partner account balance
   - Gradient green styling
   - Wallet icon

2. **Commission Statistics** (Lines 982-1081)
   - **Row 1 (4 cards)**:
     - Total Transactions (blue)
     - Total Gagné/Earned (green)
     - Commission Payée/Paid (orange)
     - Commission Impayée/Unpaid (red)
   - **Row 2 (4 cards)**:
     - Commission Payable (purple)
     - Transactions Payables (indigo)
     - Commission Mois Actuel/Current Month (emerald)
     - Transactions Mois Actuel (teal)

3. **Commission Configuration Form** (Lines 1083-1161)
   - Deposit commission rate input
   - Withdrawal commission rate input
   - Save/Update button
   - "Payer Commission" button (opens payment modal)

4. **Current Configuration Display** (Lines 1163-1204)
   - Shows existing config if available
   - Displays rates, updated by, last updated date

### Required Icons (from lucide-react)

```typescript
import { 
  TrendingUp,    // Modal title, stats
  Wallet,        // Partner balance
  DollarSign,    // Total transactions
  CheckCircle,   // Commission paid
  Clock,         // Commission unpaid
  CreditCard,    // Commission payable, payment button
  Users,         // Transactions payables
  Calendar,      // Current month
  Settings       // Configuration form
} from "lucide-react"
```

---

## Data Models

### Commission Config Model

```typescript
interface CommissionConfig {
  uid: string
  partner: string
  deposit_commission_rate: string // e.g., "2.00"
  withdrawal_commission_rate: string // e.g., "3.00"
  updated_by: number
  updated_by_name: string
  updated_at: string
  created_at?: string
}
```

### Commission Stats Model

```typescript
interface CommissionStats {
  commissions: {
    total_transaction_count: number
    total_earned: string
    total_paid: string
    total_unpaid: string
    payable: string
    payable_count: number
    current_month: string
    current_month_count: number
  }
}
```

### Partner Account Info Model

```typescript
interface PartnerAccountInfo {
  balance: string
  formatted_balance: string // e.g., "XOF 1,234.56"
}
```

---

## Complete Code Implementation

### Modal JSX Structure

```typescript
{/* Betting Commission Modal */}
<Dialog open={bettingCommissionModalOpen} onOpenChange={setBettingCommissionModalOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-orange-600" />
        <span>Commissions de Paris - {bettingCommissionPartner?.display_name || 'Partenaire'}</span>
      </DialogTitle>
    </DialogHeader>
    
    {bettingCommissionLoading ? (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    ) : bettingCommissionError ? (
      <ErrorDisplay error={bettingCommissionError} />
    ) : (
      <div className="space-y-6">
        {/* Partner Balance Card */}
        {partnerAccountInfo && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde du Compte</p>
                    <p className="text-2xl font-bold text-green-600">{partnerAccountInfo.formatted_balance}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards - First Row */}
        {bettingCommissionStats && bettingCommissionStats.commissions && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Transactions */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Transactions</p>
                      <p className="text-lg font-bold text-blue-600">
                        {bettingCommissionStats.commissions.total_transaction_count}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Earned */}
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Gagné</p>
                      <p className="text-lg font-bold text-green-600">
                        XOF {parseFloat(bettingCommissionStats.commissions.total_earned || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commission Paid */}
              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Commission Payée</p>
                      <p className="text-lg font-bold text-orange-600">
                        XOF {parseFloat(bettingCommissionStats.commissions.total_paid || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commission Unpaid */}
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">Commission Impayée</p>
                      <p className="text-lg font-bold text-red-600">
                        XOF {parseFloat(bettingCommissionStats.commissions.total_unpaid || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards - Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Commission Payable */}
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Commission Payable</p>
                      <p className="text-lg font-bold text-purple-600">
                        XOF {parseFloat(bettingCommissionStats.commissions.payable || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions Payables */}
              <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Transactions Payables</p>
                      <p className="text-lg font-bold text-indigo-600">
                        {bettingCommissionStats.commissions.payable_count}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Month Commission */}
              <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Commission Mois Actuel</p>
                      <p className="text-lg font-bold text-emerald-600">
                        XOF {parseFloat(bettingCommissionStats.commissions.current_month || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Month Transactions */}
              <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-sm font-medium text-teal-800 dark:text-teal-300">Transactions Mois Actuel</p>
                      <p className="text-lg font-bold text-teal-600">
                        {bettingCommissionStats.commissions.current_month_count}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Commission Configuration Form */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <span>Configuration des Commissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveBettingCommission} className="space-y-4">
              {bettingCommissionError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <ErrorDisplay error={bettingCommissionError} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deposit_commission_rate">Taux de Commission Dépôt (%)</Label>
                  <Input
                    id="deposit_commission_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={bettingCommissionForm.deposit_commission_rate}
                    onChange={(e) => setBettingCommissionForm(prev => ({ 
                      ...prev, 
                      deposit_commission_rate: e.target.value 
                    }))}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawal_commission_rate">Taux de Commission Retrait (%)</Label>
                  <Input
                    id="withdrawal_commission_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={bettingCommissionForm.withdrawal_commission_rate}
                    onChange={(e) => setBettingCommissionForm(prev => ({ 
                      ...prev, 
                      withdrawal_commission_rate: e.target.value 
                    }))}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={bettingCommissionLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {bettingCommissionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      {bettingCommissionConfig ? 'Mettre à jour' : 'Créer'} Configuration
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBettingCommissionPaymentModalOpen(true)}
                  disabled={bettingCommissionLoading}
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/30"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payer Commission
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Configuration Display */}
        {bettingCommissionConfig && (
          <Card className="bg-gray-50 dark:bg-gray-700 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Configuration Actuelle</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Taux de Commission Dépôt:
                  </span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {bettingCommissionConfig.deposit_commission_rate}%
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Taux de Commission Retrait:
                  </span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {bettingCommissionConfig.withdrawal_commission_rate}%
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis à jour par:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {bettingCommissionConfig.updated_by_name}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Dernière mise à jour:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {bettingCommissionConfig.updated_at 
                      ? new Date(bettingCommissionConfig.updated_at).toLocaleString()
                      : 'Non disponible'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )}
  </DialogContent>
</Dialog>
```

---

## Commission Payment Modal

The payment modal is a separate dialog that can be opened from the commission modal.

**Location**: Lines 1210-1276

**Trigger**: Click "Payer Commission" button in commission modal

**Features**:
- Admin notes textarea
- Pays all unpaid commissions (when `transaction_ids` is `null`)
- Refreshes commission stats after payment

**Form**:
```typescript
<Textarea
  id="admin_notes"
  placeholder="Ajouter des notes pour ce paiement de commission..."
  value={bettingCommissionPaymentForm.admin_notes}
  onChange={(e) => setBettingCommissionPaymentForm(prev => ({ 
    ...prev, 
    admin_notes: e.target.value 
  }))}
  rows={3}
/>
```

---

## Integration Checklist

- [ ] Add all state variables (lines 66-83)
- [ ] Implement `handleOpenBettingCommission` function
- [ ] Implement `handleSaveBettingCommission` function
- [ ] Implement `handlePayBettingCommission` function
- [ ] Add betting commission modal JSX (lines 946-1208)
- [ ] Add commission payment modal JSX (lines 1210-1276)
- [ ] Import required icons from lucide-react
- [ ] Ensure API endpoints are implemented on backend
- [ ] Test modal opening/closing
- [ ] Test commission config creation/update
- [ ] Test commission payment
- [ ] Verify stats display correctly
- [ ] Check error handling

---

## Styling Notes

- Uses Tailwind CSS classes
- Supports dark mode via `dark:` prefix
- Color scheme:
  - Orange: Primary actions and titles
  - Green: Balance and earned amounts
  - Blue: Total transactions
  - Red: Unpaid commissions
  - Purple/Indigo/Emerald/Teal: Secondary stats

---

**Last Updated**: Based on `app/dashboard/partner/page.tsx` implementation



