import { User } from "./user.interface";

export interface Post {
    id:number;
    date?:string|null;
    date_gmt?:string|null;
    guid?:{'rendered':string}|null;
    modified?:string|null;
    modified_gmt?:string|null;
    slug?:string|null;
    generated_slug?:string|null;
    status?:'publish' | 'future' | 'draft' | 'pending' | 'private'|null;
    type?:string|null;
    link?:string|null;
    title?:{'rendered':string}|null;
    content?:{'rendered':string, 'protected': boolean}|null;
    author?: number|null;
    excerpt?:{'rendered':string, 'protected': boolean}|null;
    featured_media?:number|null;
    comment_status?:'open' | 'closed'|null;
    format?: 'standard' | 'aside' | 'chat' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio'|null;
    meta?: any[]|null;
    sticky?:boolean;
    template?:string|null;
    categories?:number[]|null;
    tags?:number[]|null;
    password?:string|null;


    authorInfo?:User|null;
    featuredImage?:string|null;
}
