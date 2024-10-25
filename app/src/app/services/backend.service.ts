import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { map, Observable, of } from "rxjs";
import { PostCategory } from "../interfaces/backend/category.interface";
import { Injectable } from "@angular/core";
import { Post } from "../interfaces/backend/post.interface";
import { User } from "../interfaces/backend/user.interface";
import { Media } from "../interfaces/backend/media.interface";
import { Tag } from "../interfaces/backend/tag,interface";


export type PostCategoryOrderByType = 'id' | 'count' | 'name' | 'slug' | 'term_group' | 'term_order';
export type PostCategoryFilterType = PostCategoryOrderByType | 'parent' | 'description';

export type PostOrderByType = 'id' | 'author' | 'date' | 'modified' | 'slug' | 'title' | 'name';
export type PostColumnFilterType = PostOrderByType | 'excerpt' | 'content' | 'date_gmt' | 'guid' | 'link' | 
                                            'status' | 'modified_gmt' | 'type' | 'generated_slug' | 'featured_media' | 
                                            'comment_status' | 'format' | 'sticky' | 'categories' | 'tags';

export type PostSearchColumnType = 'post_title' | 'post_content' | 'post_excerpt' | 'post_excerpt';


export type PostAuthorFilterType = 'id' | 'name' | 'url' | 'description' | 'link' | 'slug' | 'avatar_urls' | 'meta';

export type MediaFilterType = 'id' | 'source_url' | 'date' | 'modified' | 'slug' | 'status' | 'type' | 'author' | 'media_type';

export enum ErrorCode {
    INVALID_PAGE = "rest_post_invalid_page_number"
}

@Injectable({
    providedIn: 'root',
    
})
export class BackendService {
    private url:string;
    private username:string;
    private password:string;

    private EXCLUDED_CATEGORIES = [
        1 // Uncategorized
    ]



    constructor(
        private http:HttpClient
    ) {
        this.url = environment.WORDPRESS_BACKEND_API;
        this.username = environment.WORDPRESS_API_KEY_USERNAME;
        this.password = environment.WORDPRESS_API_KEY;

    }

    private get<T>(path:string, params:{[key:string]:any}, isPublicEndpoint:boolean=true):Observable<T> {
        params = params || {};
        return this.http.get<T>(this.url + path, {
            params: params,
            headers: !isPublicEndpoint ? {
                "Authorization": "Basic " + btoa(this.username + ":" + this.password)
            } : {}
        });
    }

    private post<T>(path:string, body:{[key:string]: any}, params:{[key:string]: any}):Observable<T> {
        params = params || {};
        return this.http.post<T>(this.url + path, body, {
            params: params,
            headers:  {
                "Authorization": "Basic " + btoa(this.username + ":" + this.password)
            }
        });
    }

    getPostCategories(
        {
            pageSize=10,
            page=1,
            orderBy='name',
            desc=false,
            filter='',
            fields=['id', 'name', 'slug'],
            parent=0
        }: {
            pageSize?: number,
            page?: number,
            orderBy?: PostCategoryOrderByType,
            desc?: boolean,
            filter?: string,
            fields?: PostCategoryFilterType[],
            parent?:number|null
        }={}
    ):Observable<PostCategory[]> {
        const hideEmpty = true;
        const params = {
            "per_page": pageSize,
            "page": page,
            "orderby": orderBy,
            "hide_empty": hideEmpty,
            "exclude": this.EXCLUDED_CATEGORIES,
            "order": desc ? 'desc' : 'asc'
        };
        if(fields && fields.length > 0) params['_fields[]'] = fields;
        if(filter && filter.length > 0) params['search'] = filter;
        if(!!parent || parent == 0) params['parent'] = parent;
        return this.get<PostCategory[]>('/categories', params);
    }

    getTotalPosts(categoryId:number):Observable<number> {
        if(!categoryId) return of(0);
        return this.get<PostCategory>('/categories/' + categoryId, {})
            .pipe(
               map((category) => category.count || 0)
            );
    }

    getMedia(
        id:number,        
        {
            fields=['id', 'source_url'],
        }: {
            fields?: MediaFilterType[]
        }={}
    ):Observable<Media> {
        if(!id) return null;
        const params = {
            '_fields[]': fields
        }
        return this.get<Media>('/media/' + id, params);
    }


    getPostList(
        categoryId:number,
        {
            pageSize=10,
            page=1,
            orderBy='date',
            desc=true,
            fields=['id', 'title', 'name', 'date', 'slug', 'author'],
            filter='',
            searchColumns=[],
        }:{
            pageSize?:number,
            page?:number,
            orderBy?:PostOrderByType,
            desc?:boolean,
            fields?:PostColumnFilterType[],
            filter?:string,
            searchColumns?:PostSearchColumnType[],
        }={}
    ): Observable<Post[]> {
        const params = {
            "per_page": pageSize,
            "page": page,
            "orderby": orderBy,
            "order": desc ? 'desc' : 'asc',
            "categories": categoryId
        };
        if(fields && fields.length > 0) {
            params['_fields[]'] = fields;
        }
        if(filter && filter.length > 0) {
            params['search'] = filter;
            if(searchColumns && searchColumns.length > 0) {
                params['search_columns'] = searchColumns;
            }
        }
        return this.get<Post[]>('/posts', params);
    }

    getAuthor(
        id:number,
        {
            fields=['id', 'name', 'url', 'slug', 'avatar_urls']
        }: {
            fields?: PostAuthorFilterType[]
        }={}
    ):Observable<User|null> {
        if(!id) return null;
        if(!fields || fields.length === 0) fields = ['id', 'name', 'url', 'slug']
        const params = {
            '_fields[]': fields
        }
        return this.get<User>('/users/' + id, params);
    }

    getPost(
        id:number,
        {
            fields=['id', 'title', 'name', 'date', 'slug', 'author', 'content', 'excerpt', 'categories', 'tags', 'featured_media'],
        }: {
            fields?: PostColumnFilterType[]
        }={}
    ):Observable<Post> {
        if(!id) return null;
        const params = {
            '_fields[]': fields
        }
        return this.get<Post>('/posts/' + id, params);
    }

    getTag(id:number): Observable<Tag> {
        return this.get<Tag>('/tags/' + id, {});
    }

    // Reusable methods for components
    addFeaturedImageToPost(imageId:number, post:Post): Observable<Post> {
        if(!imageId) return null;
        return this.getMedia(imageId, {fields: ['id', 'source_url']}).pipe(
            map((media) => {
            post.featuredImage = media.source_url;
            return post;
            })
        );
    }

    addAuthorToPost(authorId:number, post:Post): Observable<Post> {
        if(!authorId) return null;
        return this.getAuthor(authorId,{fields: ['id', 'name', 'avatar_urls']}).pipe(
            map((author:User) => {
            post.authorInfo = author;
            return post;
            })
        );
    }
}