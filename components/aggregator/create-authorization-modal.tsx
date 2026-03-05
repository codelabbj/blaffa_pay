"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useAggregatorApi, UserAuthorization, NetworkMapping, AggregatorUser } from "@/lib/aggregator-api"
import { useToast } from "@/hooks/use-toast"
import { Loader, Save, X } from "lucide-react"

interface CreateAuthorizationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    editingAuth?: UserAuthorization | null
}

export function CreateAuthorizationModal({
    open,
    onOpenChange,
    onSuccess,
    editingAuth,
}: CreateAuthorizationModalProps) {
    const { grantAuthorization, updateAuthorization, listNetworkMappings, getAggregatorUsers } = useAggregatorApi()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [networks, setNetworks] = useState<NetworkMapping[]>([])
    const [users, setUsers] = useState<AggregatorUser[]>([])

    const [formData, setFormData] = useState<Partial<UserAuthorization>>({
        user: "",
        network: "",
        user_payin_fee_percent: 0,
        user_payout_fee_percent: 0,
        is_active: true,
    })

    useEffect(() => {
        if (open) {
            fetchInitialData()
            if (editingAuth) {
                setFormData({
                    user: editingAuth.user,
                    network: editingAuth.network,
                    user_payin_fee_percent: editingAuth.user_payin_fee_percent,
                    user_payout_fee_percent: editingAuth.user_payout_fee_percent,
                    is_active: editingAuth.is_active,
                })
            } else {
                setFormData({
                    user: "",
                    network: "",
                    user_payin_fee_percent: 0,
                    user_payout_fee_percent: 0,
                    is_active: true,
                })
            }
        }
    }, [open, editingAuth])

    const fetchInitialData = async () => {
        try {
            const [networksData, usersData] = await Promise.all([
                listNetworkMappings(),
                getAggregatorUsers()
            ])
            setNetworks(networksData.results || networksData || [])
            setUsers(usersData.results || usersData || [])
        } catch (err) {
            console.error("Failed to fetch initial data", err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (editingAuth) {
                await updateAuthorization(editingAuth.uid, formData)
                toast({ title: "Authorization Updated", description: "The authorization has been updated successfully." })
            } else {
                await grantAuthorization(formData)
                toast({ title: "Authorization Granted", description: "The authorization has been granted successfully." })
            }
            onSuccess()
            onOpenChange(false)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to save authorization.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingAuth ? "Edit Authorization" : "Grant New Authorization"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user">Aggregator User</Label>
                        <Select
                            value={formData.user}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, user: val }))}
                            disabled={!!editingAuth}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an aggregator" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(u => (
                                    <SelectItem key={u.uid} value={u.uid}>{u.display_name} ({u.email})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="network">Payment Network</Label>
                        <Select
                            value={formData.network}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, network: val }))}
                            disabled={!!editingAuth}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                            <SelectContent>
                                {networks.map(n => (
                                    <SelectItem key={n.uid} value={n.uid}>{n.network_name || n.network}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="payin_fee">Payin Fee (%)</Label>
                            <Input
                                id="payin_fee"
                                type="number"
                                step="0.01"
                                value={formData.user_payin_fee_percent}
                                onChange={(e) => setFormData(prev => ({ ...prev, user_payin_fee_percent: parseFloat(e.target.value) }))}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payout_fee">Payout Fee (%)</Label>
                            <Input
                                id="payout_fee"
                                type="number"
                                step="0.01"
                                value={formData.user_payout_fee_percent}
                                onChange={(e) => setFormData(prev => ({ ...prev, user_payout_fee_percent: parseFloat(e.target.value) }))}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                            {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {editingAuth ? "Update" : "Grant"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
