"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Loader2 } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { Device } from "@/lib/types/device-authorization"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getApiBaseUrl } from "@/lib/env-config"
import { cn } from "@/lib/utils"

interface DeviceSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (devices: Device[]) => void;
    selectedDeviceUids?: string[];
    /** UIDs déjà autorisés pour le partenaire sélectionné — grisés, non cliquables. */
    disabledDeviceUids?: string[];
}

export function DeviceSelectionModal({
    open,
    onOpenChange,
    onSelect,
    selectedDeviceUids = [],
    disabledDeviceUids = [],
}: DeviceSelectionModalProps) {
    const { t } = useLanguage()
    const apiFetch = useApi()
    const baseUrl = getApiBaseUrl()

    const [loading, setLoading] = useState(false)
    const [devices, setDevices] = useState<Device[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [draftUids, setDraftUids] = useState<string[]>([])

    const fetchDevices = useCallback(async () => {
        setLoading(true)
        try {
            const response = await apiFetch(`payments/stats/devices/`)
            const data = Array.isArray(response) ? response : (response.results || [])
            setDevices(data)
        } catch (err) {
            console.error("Failed to fetch devices", err)
        } finally {
            setLoading(false)
        }
    }, [apiFetch, baseUrl])

    useEffect(() => {
        if (!open) return
        const disabled = new Set(disabledDeviceUids.map(String))
        setDraftUids(
            selectedDeviceUids
                .map(String)
                .filter((uid) => uid && !disabled.has(uid)),
        )
        setSearchTerm("")
        fetchDevices()
        // Sync draft only when the modal opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, fetchDevices])

    const disabledSet = useMemo(
        () => new Set(disabledDeviceUids.map(String)),
        [disabledDeviceUids],
    )
    const draftSet = useMemo(() => new Set(draftUids.map(String)), [draftUids])

    const filteredDevices = devices.filter(device =>
        device.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.device_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectableFiltered = filteredDevices.filter(
        (device) => !disabledSet.has(String(device.uid)),
    )
    const allFilteredSelected =
        selectableFiltered.length > 0 &&
        selectableFiltered.every((device) => draftSet.has(String(device.uid)))

    const toggleDevice = (device: Device) => {
        const uid = String(device.uid)
        if (disabledSet.has(uid)) return
        setDraftUids((prev) =>
            prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
        )
    }

    const toggleSelectAllFiltered = () => {
        const filteredIds = selectableFiltered.map((d) => String(d.uid))
        if (allFilteredSelected) {
            setDraftUids((prev) => prev.filter((id) => !filteredIds.includes(id)))
            return
        }
        setDraftUids((prev) => Array.from(new Set([...prev, ...filteredIds])))
    }

    const confirmSelection = () => {
        const selected = devices.filter((device) => draftSet.has(String(device.uid)))
        onSelect(selected)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] max-h-[min(90dvh,720px)] p-0 gap-0 overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0 px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
                    <DialogTitle>
                        <span>{t("deviceAuthorizations.selectDevices")}</span>
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {t("deviceAuthorizations.selectDevicesHint")}
                    </p>
                </DialogHeader>
                <div className="flex-1 min-h-0 px-4 sm:px-6 pb-2 space-y-3 flex flex-col">
                    <div className="shrink-0 flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading || selectableFiltered.length === 0}
                            onClick={toggleSelectAllFiltered}
                        >
                            {allFilteredSelected
                                ? t("deviceAuthorizations.deselectAll")
                                : t("deviceAuthorizations.selectAll")}
                        </Button>
                        <Badge variant="secondary" className="text-[11px]">
                            {draftUids.length} {t("deviceAuthorizations.selectedCount")}
                        </Badge>
                    </div>
                    <Command shouldFilter={false} className="flex-1 min-h-0 overflow-hidden border rounded-md">
                        <CommandInput
                            placeholder={t("common.search")}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList className="max-h-[min(42dvh,360px)] overflow-y-auto overscroll-contain">
                            <CommandEmpty>
                                {loading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <span>{t("common.noData")}</span>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {filteredDevices.map((device) => {
                                    const uid = String(device.uid)
                                    const alreadyAuthorized = disabledSet.has(uid)
                                    const checked = draftSet.has(uid)
                                    return (
                                        <CommandItem
                                            key={device.uid}
                                            disabled={alreadyAuthorized}
                                            value={`${device.device_name || ""} ${device.device_id || ""} ${uid}`}
                                            onSelect={() => toggleDevice(device)}
                                            className={cn(
                                                "flex flex-wrap items-start justify-between gap-3 sm:items-center py-3",
                                                alreadyAuthorized
                                                    ? "opacity-45 cursor-not-allowed grayscale"
                                                    : "cursor-pointer",
                                                checked && !alreadyAuthorized && "bg-primary/5",
                                            )}
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <Checkbox
                                                    checked={checked}
                                                    disabled={alreadyAuthorized}
                                                    onCheckedChange={() => toggleDevice(device)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-0.5"
                                                    aria-label={device.device_name || device.device_id}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium truncate">
                                                        {device.device_name || device.device_id}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {device.device_id}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {alreadyAuthorized ? (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        <span>{t("deviceAuthorizations.alreadyAuthorized")}</span>
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant={device.is_online ? "success" : "secondary"}
                                                        className="text-[10px]"
                                                    >
                                                        {device.is_online
                                                            ? <span>{t("common.online")}</span>
                                                            : <span>{t("common.offline")}</span>}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
                <DialogFooter className="shrink-0 gap-2 sm:gap-2 border-t bg-background px-4 py-3 sm:px-6 sticky bottom-0">
                    <DialogClose asChild>
                        <Button variant="outline">
                            <span>{t("common.cancel")}</span>
                        </Button>
                    </DialogClose>
                    <Button onClick={confirmSelection} disabled={draftUids.length === 0}>
                        {t("deviceAuthorizations.confirmDevices").replace(
                            "{count}",
                            String(draftUids.length),
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
