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
import { Switch } from "@/components/ui/switch"
import { useAggregatorApi, NetworkMapping } from "@/lib/aggregator-api"
import { useToast } from "@/hooks/use-toast"
import { Loader, Save, Globe } from "lucide-react"

interface CreateNetworkMappingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    editingMapping?: NetworkMapping | null
}

export function CreateNetworkMappingModal({
    open,
    onOpenChange,
    onSuccess,
    editingMapping,
}: CreateNetworkMappingModalProps) {
    const { createNetworkMapping } = useAggregatorApi()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState<Partial<NetworkMapping>>({
        network: "",
        network_name: "",
        network_payin_fee_percent: "0.00",
        enable_payin: true,
        payin_processor: "orange_money",
        payin_url: "",
        min_amount: "100",
        max_amount: "1000000",
    })

    useEffect(() => {
        if (open) {
            if (editingMapping) {
                setFormData({
                    network: editingMapping.network,
                    network_name: editingMapping.network_name,
                    network_payin_fee_percent: editingMapping.network_payin_fee_percent,
                    enable_payin: editingMapping.enable_payin,
                    payin_processor: editingMapping.payin_processor,
                    payin_url: editingMapping.payin_url,
                    min_amount: editingMapping.min_amount,
                    max_amount: editingMapping.max_amount,
                })
            } else {
                setFormData({
                    network: "",
                    network_name: "",
                    network_payin_fee_percent: "0.00",
                    enable_payin: true,
                    payin_processor: "orange_money",
                    payin_url: "",
                    min_amount: "100",
                    max_amount: "1000000",
                })
            }
        }
    }, [open, editingMapping])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createNetworkMapping(formData)
            toast({ title: "Mapping Saved", description: "The network mapping has been saved successfully." })
            onSuccess()
            onOpenChange(false)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to save network mapping.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-orange-500" />
                        {editingMapping ? "Edit Network Mapping" : "Create New Network Mapping"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="network">Network Code (e.g. OM_SN)</Label>
                            <Input
                                id="network"
                                value={formData.network}
                                onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value }))}
                                placeholder="OM_SN"
                                disabled={!!editingMapping}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="network_name">Display Name</Label>
                            <Input
                                id="network_name"
                                value={formData.network_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, network_name: e.target.value }))}
                                placeholder="Orange Money Senegal"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="processor">Processor</Label>
                            <Select
                                value={formData.payin_processor}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, payin_processor: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select processor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="orange_money">Orange Money</SelectItem>
                                    <SelectItem value="moov">Moov</SelectItem>
                                    <SelectItem value="mtn">MTN</SelectItem>
                                    <SelectItem value="wave">Wave</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="base_fee">Base Network Fee (%)</Label>
                            <Input
                                id="base_fee"
                                type="number"
                                step="0.01"
                                value={formData.network_payin_fee_percent}
                                onChange={(e) => setFormData(prev => ({ ...prev, network_payin_fee_percent: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">Gateway URL</Label>
                        <Input
                            id="url"
                            value={formData.payin_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, payin_url: e.target.value }))}
                            placeholder="https://api.provider.com/process"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="min_amount">Min Amount</Label>
                            <Input
                                id="min_amount"
                                type="number"
                                value={formData.min_amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, min_amount: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_amount">Max Amount</Label>
                            <Input
                                id="max_amount"
                                type="number"
                                value={formData.max_amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, max_amount: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Label htmlFor="enable" className="font-semibold">Enable Payin</Label>
                        <Switch
                            id="enable"
                            checked={formData.enable_payin}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_payin: checked }))}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                            {loading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {editingMapping ? "Update Mapping" : "Create Mapping"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
