import { Component, OnInit, ViewChild } from '@angular/core';
import { BackendService, ErrorCode, PostColumnFilterType, PostSearchColumnType } from '../../services/backend';
import { Post } from '../../interfaces/backend/post.interface';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { forkJoin, map, mergeMap, Observable } from 'rxjs';
import { MatActionList, MatList, MatListItem, MatListItemLine, MatListItemTitle, MatListOption, MatSelectionList } from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardImage, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { PostCategory } from '../../interfaces/backend/category.interface';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { BackendError } from '../../interfaces/backend/error.interface';
import { Tag } from '../../interfaces/backend/tag,interface';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { RoutePaths } from '../../app.constants';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss',
  standalone: true,
  providers: [
    BackendService
  ],
  

  imports: [
    MatList, 
    MatListItem, 
    MatActionList,
    MatListItemTitle,
    MatListItemLine,
    MatSelectionList,
    MatListOption,

    MatDivider,

    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardImage,
    MatCardActions,

    MatInputModule,
    MatFormFieldModule,
    MatButton,

    NgFor,
    NgIf,
    FormsModule,

    PostCardComponent,
  ],
  
})
export class PostListComponent implements OnInit {
  categories:PostCategory[] = [];
  posts:Post[] = [];
  tags:{[key:number]: Tag} = {};


  
  currentPage:number = 1;
  pageSize:number = 10;
  categoryName:string;
  categoryID:number;
  totalItems:number = 0;
  fetchPostError = "";
  @ViewChild('keywordFieldSelectionList') keywordFieldSelectionList:MatSelectionList;

  searchTerm:string;
  lookupPostAt: {value: PostSearchColumnType, label: string}[] = [
    {
      value: 'post_title',
      label: 'Title',
    },
    {
      value: 'post_content',
      label: 'Content',
    },
    {
      value: 'post_excerpt',
      label: 'Excerpt',
    }
  ];

  currentSearchKeyword:string = '';
  currentLookupFilters:PostSearchColumnType[] = [];


  constructor(
    private backendService:BackendService,
    private activatedRoute:ActivatedRoute,
    private router:Router
  ) {

  }

  ngOnInit(): void {
      this.activatedRoute.paramMap.subscribe({
        next: (params: ParamMap) => {
          this.resetDefaults();
          if(this.keywordFieldSelectionList && this.keywordFieldSelectionList.selectedOptions) {
            this.keywordFieldSelectionList.selectedOptions.clear();
          }

          if(params.has('id')) {
            const id = params.get('id').replaceAll(/\s+/g, '');
            if(id.length > 0) this.categoryID = parseInt(id);
          }
          if(params.has('name')) {
            this.categoryName = params.get('name');
          }
          if(!!this.categoryID && this.categoryID > 1) {
            this.fetchPostList(this.categoryID);
            this.fetchPostCategories();
            this.addTotalPostCount();
          }
        },
        error: (err) => console.error(err),
        // complete: () => console.log('Completed fetching post list')
      });

  }

  fetchPostCategories() {
    this.categories = [];
    this.backendService.getPostCategories({
      pageSize: 100,
      fields: ['id', 'name', 'slug', 'description'],
      parent: this.categoryID
    }).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => console.error(err),
      // complete: () => console.log('Completed fetching post categories')
    });

  }

  addTotalPostCount() {
    this.backendService.getTotalPosts(this.categoryID).subscribe({
      next: (count) => {
        this.totalItems = count;
      },
      error: (err) => console.error(err),
      // complete: () => console.log('Completed fetching total post count')
    });
  }

  addTags(tags:number[]) {
    if(!tags || tags.length == 0) return;
    tags.forEach((tagId) => {
      if(this.tags[tagId]) return;
      this.backendService.getTag(tagId).subscribe({
        next: (tag) => {
          this.tags[tagId] = tag;
          console.log(this.tags);
        },
        error: (err) => console.error(err),
        // complete: () => console.log('Completed fetching tag')
      });
    });
  }

  fetchPostList(categoryId): void {

    // Fetch all posts
    this.backendService.getPostList(
      categoryId,
      {
        page: this.currentPage,
        pageSize: this.pageSize,
        fields: ['id', 'title', 'excerpt', 'author', 'date_gmt', 'featured_media', 'tags'],
        searchColumns: this.currentLookupFilters,
        filter: this.currentSearchKeyword
      }
    )
    .subscribe({
      next: (posts) => {
        if(!posts || posts.length == 0) {
        }
        posts.forEach((post) => {
          this.addTags(post.tags);
          this.posts.push(post);
        });
      },
      error: (err) => {
        console.error(err);
        if(typeof err != 'object' || !err.error) return;
        try {
          let backendError:BackendError = err.error as BackendError;
          if(!backendError || !backendError.code) return;
          if(backendError.code == ErrorCode.INVALID_PAGE) {
            this.fetchPostError = backendError.code;
          }
          
        } catch(e) {

        }
      },
      complete: () => {
        this.searchTerm = "";
        this.keywordFieldSelectionList.selectedOptions.clear();
      }
    });
  }

  private resetDefaults() {
    this.posts = [];
    this.currentPage = 1;
    this.fetchPostError = "";

    this.currentLookupFilters = [];
    this.currentSearchKeyword = "";
  }

  searchKeyword(clearPrevious:boolean=true) {
    if(clearPrevious) this.resetDefaults();
    if(this.searchTerm && this.searchTerm.length > 0) this.currentSearchKeyword = this.searchTerm;
    if(this.keywordFieldSelectionList.selectedOptions.selected.length > 0) this.currentLookupFilters = this.keywordFieldSelectionList.selectedOptions.selected.map((option) => option.value);
    if(!this.searchTerm || this.searchTerm.length < 1) {
      this.fetchPostList(this.categoryID);
      return;
    }
    const searchColumns = this.keywordFieldSelectionList.selectedOptions.selected.map((option) => option.value);
    this.fetchPostList(this.categoryID);
  }

  loadMorePosts() {
    this.currentPage = this.currentPage + 1;
    this.searchKeyword(false); // If search keyword is empty, it will fetch all posts
  }

  goToPage(name:string, id:number): void {
    this.router.navigate([`/${RoutePaths.posts}`, id, name]);
  }

}
