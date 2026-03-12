"use client"

import { useApi } from "./useApi"
import { useCallback } from "react"

export interface AggregatorDashboardStats {
    users: {
        total_aggregators: number
        active_aggregators: number
        inactive_aggregators: number
        active_today: number
        active_last_7_days: number
    }
    transactions: {
        total_count: number
        pending_count: number
        processing_count: number
        success_count: number
        failed_count: number
        cancelled_count: number
        success_rate: number
    }
    payin: {
        total_count: number
        success_count: number
        total_amount: number
        total_user_fees: number
        total_network_fees: number
        total_platform_profit: number
    }
    payout: {
        total_count: number
        success_count: number
        total_amount: number
        total_user_fees: number
        total_network_fees: number
        total_platform_profit: number
    }
    today: {
        total_count: number
        success_count: number
        total_amount: number
        total_platform_profit: number
    }
    last_7_days: {
        total_count: number
        success_count: number
        total_amount: number
        total_platform_profit: number
    }
    last_30_days: {
        total_count: number
        success_count: number
        total_amount: number
        total_platform_profit: number
    }
    top_aggregators: {
        user__uid: string
        user__email: string
        user__phone: string | null
        user__first_name: string
        user__last_name: string
        tx_count: number
        total_amount: number
    }[]
    network_stats: {
        network__nom: string
        tx_count: number
        total_amount: number
        total_platform_profit: number
    }[]
    meta: {
        generated_at: string
    }
}

export interface AggregatorUser {
    uid: string
    display_name: string
    email: string
    phone: string
    is_aggregator: boolean
    account_balance: string
    is_active: boolean
    created_at: string
}

export interface UserAuthorization {
    uid: string
    user: string
    user_name?: string
    network: string
    network_name?: string
    user_payin_fee_percent: number
    user_payout_fee_percent: number
    is_active: boolean
}

export interface NetworkMapping {
    uid: string
    network: string
    network_name?: string
    network_payin_fee_percent: string
    enable_payin: boolean
    payin_processor: string
    payin_url: string
    min_amount: string
    max_amount: string
}

export interface AggregatorTransaction {
    uid: string
    reference: string
    amount: string
    net_amount: string
    user_fee: string
    network_fee: string
    platform_profit: string
    profit: string
    status: string
    type: "payin" | "payout"
    user: string
    user_name?: string
    network: string
    network_name?: string
    processor_reference: string
    created_at: string
}

export function useAggregatorApi() {
    const apiFetch = useApi()
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

    const getDashboardStats = useCallback(async () => {
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/dashboard/`)
    }, [apiFetch, baseUrl])

    const getAggregatorUsers = useCallback(async (params?: URLSearchParams) => {
        const queryString = params ? `?${params.toString()}` : ""
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/?is_aggregator=true&${queryString.replace(/^\?/, "")}`)
    }, [apiFetch, baseUrl])

    const getUserStats = useCallback(async (uid: string) => {
        try {
            return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/aggregators/${uid}/stats/`)
        } catch (err: any) {
            console.warn("getUserStats failed:", err)
            if (err && err.error) {
                return new Error(err.error)
            }
            if (err instanceof Error) return err
            return new Error("Failed to fetch user stats")
        }
    }, [apiFetch, baseUrl])

    const listAuthorizations = useCallback(async (uid?: string) => {
        const queryString = uid ? `?user=${uid}` : ""
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/user-authorizations/${queryString}`)
    }, [apiFetch, baseUrl])

    const grantAuthorization = useCallback(async (payload: Partial<UserAuthorization>) => {
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/user-authorizations/`, {
            method: "POST",
            body: JSON.stringify(payload),
        })
    }, [apiFetch, baseUrl])

    const updateAuthorization = useCallback(async (uid: string, payload: Partial<UserAuthorization>) => {
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/user-authorizations/${uid}/`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
    }, [apiFetch, baseUrl])

    const listNetworkMappings = useCallback(async (params?: URLSearchParams) => {
        const queryString = params ? `?${params.toString()}` : ""
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/network-mappings/${queryString}`)
    }, [apiFetch, baseUrl])

    const getNetworks = useCallback(async (params?: URLSearchParams) => {
        const queryString = params ? `?${params.toString()}` : ""
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/${queryString}`)
    }, [apiFetch, baseUrl])

    const createNetworkMapping = useCallback(async (payload: Partial<NetworkMapping>) => {
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/network-mappings/`, {
            method: "POST",
            body: JSON.stringify(payload),
        })
    }, [apiFetch, baseUrl])

    const updateNetworkMapping = useCallback(async (uid: string, payload: Partial<NetworkMapping>) => {
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/network-mappings/${uid}/`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
    }, [apiFetch, baseUrl])

    const listTransactions = useCallback(async (params?: URLSearchParams) => {
        const queryString = params ? `?${params.toString()}` : ""
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/transactions/${queryString}`)
    }, [apiFetch, baseUrl])

    return {
        getDashboardStats,
        getAggregatorUsers,
        getUserStats,
        listAuthorizations,
        grantAuthorization,
        updateAuthorization,
        listNetworkMappings,
        getNetworks,
        createNetworkMapping,
        updateNetworkMapping,
        listTransactions,
    }
}
