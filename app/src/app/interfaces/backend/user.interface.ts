export interface User {
    id: number; 
    name: string;
    url?: string | null;
    description?: string | null;
    link?: string | null;
    slug?: string | null;
    avatar_urls?: {
        [key: string]: string;
    };
    meta?: any[] | null;
}