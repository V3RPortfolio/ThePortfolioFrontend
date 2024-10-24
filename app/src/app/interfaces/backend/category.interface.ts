export interface PostCategoryLinkContent {
    href: string;
}
export interface PostCategoryLink {
    self:PostCategoryLinkContent[];
    collection:PostCategoryLinkContent[];
    about:PostCategoryLinkContent[];
}
export interface PostCategory {
    id:number;
    count:number;
    description:string;
    link:string;
    name:string;
    slug:string;
    taxonomy:string;
    parent:number;
    meta:any[];
    _links:PostCategoryLink
}