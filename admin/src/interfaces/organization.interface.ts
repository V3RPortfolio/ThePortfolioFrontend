export interface OrganizationOut {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    status: string;
}

export interface OrganizationIn {
    name: string;
    description?: string | null;
}

export interface OrganizationUpdateIn {
    description?: string | null;
}

export interface OrganizationUserOut {
    id: string;
    organization_id: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    invitation_status: string;
}

export interface OrganizationInvitationOut {
    id: string;
    organization_id: string;
    organization_name: string;
    invited_email: string;
    invited_by: string;
    role: string;
    created_at: string;
    invitation_status: string;
}

export type OrganizationRoleType = "admin" | "owner" | "manager" | "editor" | "viewer";

export interface OrganizationUserIn {
    email: string;
    role?: OrganizationRoleType;
}

export interface OrganizationUserUpdateIn {
    role: OrganizationRoleType;
}
