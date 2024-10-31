import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { WPBackendService } from '../../services/wpbackend.service';
import { Post } from '../../interfaces/backend/post.interface';
import { AUTHOR_IMAGE_PLACEHOLDER, BACKEND_POST_SPECIFIC_STYLESHEET, getPostPublishDateReadable } from '../../app.constants';
import { User } from '../../interfaces/backend/user.interface';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { MatDivider } from '@angular/material/divider';
import { RelatedPostsComponent } from '../../components/related-posts/related-posts.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  standalone: true,
  imports: [
    MatDivider,
    PostCardComponent,
    RelatedPostsComponent
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


  constructor(
    private activatedRoute: ActivatedRoute,
    private backendService: WPBackendService
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

}
