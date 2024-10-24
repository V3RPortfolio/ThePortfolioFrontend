export interface Tag {
    id:number;
    name:string;
    slug:string;
    description?:string|null;
    count?:number|null;
    meta:any[];
}