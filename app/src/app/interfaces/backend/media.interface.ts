export interface MediaSize {
    file: string;
    width: number;
    height: number;
    filesize: number;
    mime_type: string;
    source_url: string;
}

export interface MediaDetails {
    width?: number|null;
    height?: number|null;
    file?: string|null;
    file_size?: number|null;
    sizes?: {
        [key:string]:MediaSize;
    }|null;
    image_meta?: any[]|null;
}

export interface Media {
    id: number;
    source_url: string;
    date?: string|null;
    date_gmt?: string|null;
    guid?: {
        rendered: string;
    }|null;
    modified?: string|null;
    modified_gmt?: string|null;
    slug?: string|null;
    status?: 'publish'|'future'|'draft'|'pending'|'private'|null;
    type?: string|null;
    link?: string|null;
    title: {
        rendered: string;
    };
    author?: number|null;
    media_type?: 'image'|'file'|null;
    mime_type?: string|null;
    media_details?: MediaDetails|null;
}