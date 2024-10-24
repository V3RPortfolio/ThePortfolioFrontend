import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BackendService } from '../../services/backend';
import { Post } from '../../interfaces/backend/post.interface';
import { AUTHOR_IMAGE_PLACEHOLDER, BACKEND_POST_SPECIFIC_STYLESHEET, FEATURED_IMAGE_PLACEHOLDER, getPostPublishDateReadable, singularize } from '../../app.constants';
import { User } from '../../interfaces/backend/user.interface';
import { map, Observable } from 'rxjs';
import { PostCardComponent } from '../../components/post-card/post-card.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  standalone: true,
  providers: [BackendService],
  imports: [
    PostCardComponent
  ]
})
export class PostComponent implements OnInit {

  @ViewChild('postContainer') postContainer: ElementRef;
  postId:number;
  postTitle:string;
  
  author:User;
  post:Post;
  categoryName:string;
  categoryId:number;
  relatedPosts:Post[] = [];


  constructor(
    private activatedRoute: ActivatedRoute,
    private backendService: BackendService
  ) {

  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params:ParamMap) => {
      if(params.has("id")) {
        this.postId = parseInt(params.get("id"));
      }
      if(params.has("name")) {
        this.postTitle = params.get("name");
      }

      if(params.has("catid")) {
        this.categoryId = parseInt(params.get("catid"));
      }
      if(params.has("catname")) {
        this.categoryName = params.get("catname");
      }

      if(!!this.postId && this.postId > 0) {
        this.injectPostSpecificStylesheet(this.postId);
        this.displayPost(this.postId);
        this.getRelatedPosts();
      }
    });
  }

  
  getAuthorInfo(post:Post) {
    if(!post || !post.author || post.author < 1) return;
    this.backendService.getAuthor(post.author, {fields: ['id', 'name', 'url', 'avatar_urls']}).subscribe({
      next: (author:User) => {
        this.author = author;
      },
      error: (error) => {
        console.error("Error fetching author", error);
      }
    });
  }

  getAuthorImage(author:User): string {
    if(!author || !author.avatar_urls) return AUTHOR_IMAGE_PLACEHOLDER;
    let keys = Object.keys(author.avatar_urls);
    if(keys.length == 0) return AUTHOR_IMAGE_PLACEHOLDER;
    return author.avatar_urls[keys[0]];
  }

  getPublishedDate() {
    if(!this.post || (!this.post.date_gmt && !this.post.date)) return "";
    return getPostPublishDateReadable(new Date(!!this.post.date_gmt ? this.post.date_gmt : this.post.date));
  }

  displayPost(id:number) {
    this.backendService.getPost(id).subscribe({
      next: (post:Post) => {
        this.post = post;
        this.getAuthorInfo(post);
        if(!post || !post.content || !post.content.rendered || post.content.rendered.length == 0) return;
        this.postContainer.nativeElement.innerHTML = post.content.rendered;
      },
      error: (error) => {
        console.error("Error fetching post", error);
      }
    });
  }

  injectPostSpecificStylesheet(id:number) {
    let stylesheet = BACKEND_POST_SPECIFIC_STYLESHEET.replace("{id}", id.toString());
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheet;
    document.head.appendChild(link);
  }

  getRelatedPosts() {
    if(!this.categoryId) return;
    this.backendService.getPostList(this.categoryId, {
      pageSize: 3,
      fields: ['id', 'title', 'author', 'date_gmt', 'featured_media'],
    }).subscribe({
      next: (posts:Post[]) => {
        this.relatedPosts = posts;
      },
      error: (error) => {
        console.error("Error fetching related posts", error);
      }
    });
  }

}
