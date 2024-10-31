import { Component, Input, OnInit } from '@angular/core';
import { WPBackendService, PostOrderByType } from '../../services/wpbackend.service';
import { Post } from '../../interfaces/backend/post.interface';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-related-posts',
  templateUrl: './related-posts.component.html',
  styleUrl: './related-posts.component.scss',
  standalone: true,
  imports: [
    PostCardComponent
  ]
})
export class RelatedPostsComponent implements OnInit {

  @Input('total') totalPostToDisplay:number=3;
  @Input('orderBy') orderBy:PostOrderByType='date';
  @Input('desc') descending:boolean=true;
  @Input('title') title:string = 'You may also like';

  @Input('categoryId') categoryId:number;
  @Input('categoryName') categoryName:string;

  relatedPosts: Post[] = [];
  constructor(
    private backendService: WPBackendService
  ) {

  }

  ngOnInit(): void {
    this.getRelatedPosts();
  }

  getRelatedPosts() {
    this.backendService.getPostList({
      categoryId: this.categoryId,
      pageSize: this.totalPostToDisplay,
      fields: ['id', 'title', 'author', 'date_gmt', 'featured_media'],
      orderBy: this.orderBy,
      desc: this.descending
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
