"use client"

import { useApi } from "./useApi"
import { useCallback } from "react"

export interface AggregatorDashboardStats {
    total_aggregators: number
    active_aggregators: number
    total_volume: number
    success_rate: number
    network_performance: {
        network: string
        success_rate: number
        volume: number
    }[]
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
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/aggregators/${uid}/stats/`)
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

    const listNetworkMappings = useCallback(async () => {
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/network-mappings/`)
    }, [apiFetch, baseUrl])

    const createNetworkMapping = useCallback(async (payload: Partial<NetworkMapping>) => {
        return await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/aggregator/admin/network-mappings/`, {
            method: "POST",
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
        createNetworkMapping,
        listTransactions,
    }
}
