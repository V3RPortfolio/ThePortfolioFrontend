export interface ServiceGroupOut {
    id: string;
    title: string;
    is_active: boolean;
}

export interface ServiceContentOut {
    id: string;
    content?: string;
    sequence_number: number;
}

export interface ServiceOut {
    id: string;
    title: string;
    group: ServiceGroupOut;
    contents: ServiceContentOut[];
    created_at: Date;
    updated_at?: Date;
}

export interface ServiceInfoOut {
    id: string;
    title: string;
}

export interface ServiceGroupInfoOut {
    id: string;
    title: string;
    is_active: boolean;
    services: ServiceInfoOut[];
}