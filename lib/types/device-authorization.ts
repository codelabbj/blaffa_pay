export interface DeviceAuthorization {
    uid: string;
    partner_uid: string;
    partner_name: string;
    device_uid: string;
    device_name: string;
    is_active: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface Partner {
    uid: string;
    display_name: string;
    email: string;
    phone_number?: string;
    is_partner: boolean;
}

export interface Device {
    uid: string;
    device_id: string;
    device_name: string;
    is_online: boolean;
    network_name?: string;
    user_name?: string;
}
