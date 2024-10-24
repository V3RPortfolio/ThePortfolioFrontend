import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../../interfaces/backend/post.interface';
import { BackendService } from '../../services/backend';
import { AUTHOR_IMAGE_PLACEHOLDER, FEATURED_IMAGE_PLACEHOLDER, getPostPublishDateReadable, RoutePaths } from '../../app.constants';
import { Router } from '@angular/router';
import { User } from '../../interfaces/backend/user.interface';
import { Tag } from '../../interfaces/backend/tag,interface';
import { NgClass } from '@angular/common';
import { fadeInEnterFromRight } from '../../services/triggers';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
  standalone: true,
  animations: [
    fadeInEnterFromRight(300, {paddingLeft: '20px'}, {paddingLeft: '0'}),
  ],
  imports: [
    NgClass
  ]
})
export class PostCardComponent implements OnInit {
  @Input('post') post: Post;
  @Input('postCardType') postCardType: 'list' | 'grid' = 'list';
  @Input('categoryID') categoryID: number;
  @Input('categoryName') categoryName: string;
  @Input('tags') tags: {[key:number]: Tag} = {};

  authorImagePlaceholder = AUTHOR_IMAGE_PLACEHOLDER;
  featuredImagePlaceholder = FEATURED_IMAGE_PLACEHOLDER;

  constructor(
    private backendService: BackendService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
      if(!this.post) return;
      this.backendService.addFeaturedImageToPost(this.post.featured_media, this.post).subscribe();
      this.backendService.addAuthorToPost(this.post.author, this.post).subscribe();
  }

  getFeaturedImage(post:Post): string {
    if(!post || !post.featuredImage) FEATURED_IMAGE_PLACEHOLDER;
    return post.featuredImage;
  }

  goToPost(id:number, title:string): void {
    this.router.navigate([`/${RoutePaths.post}`, this.categoryID, this.categoryName, id, title]);
  }

  getAuthorImage(authorInfo:User): string {
    if(!authorInfo || !authorInfo.avatar_urls) return AUTHOR_IMAGE_PLACEHOLDER;
    let keys = Object.keys(authorInfo.avatar_urls);
    if(keys.length == 0) return AUTHOR_IMAGE_PLACEHOLDER;
    return authorInfo.avatar_urls[keys[0]];
  }

  getPublishedDate() {
    if(!this.post || (!this.post.date_gmt && !this.post.date)) return "";
    return getPostPublishDateReadable(new Date(!!this.post.date_gmt ? this.post.date_gmt : this.post.date));
  }

}
