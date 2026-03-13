// src/app/(protected)/teams/types.ts
export interface Organization {
    id: string;
    name: string;
    myRole: string;
}

export interface Team {
    id: string;
    name: string;
    organizationId: string | null;
}