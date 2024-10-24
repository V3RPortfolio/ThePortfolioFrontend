import { Component, HostListener, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatButton } from '@angular/material/button';
import { BackendService } from '../../services/backend';
import { PostCategory } from '../../interfaces/backend/category.interface';
import { Router } from '@angular/router';
import { RoutePaths } from '../../app.constants';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    animations: [
        trigger('navbarHeight', [
            state('expanded', style({
                paddingTop: '30px',
                paddingBottom: '30px',
            })),
            state('collapsed', style({
                paddingTop: '15px',
                paddingBottom: '15px',
            })),
            transition('expanded <=> collapsed', animate('100ms ease-in-out'))
        ])
    ],
    standalone: true,
    imports: [MatButton],
    providers: [BackendService]
})
export class HeaderComponent implements OnInit {
  scrollOffset = 20;
  headerHeight: number = 100;
  isExpanded = true; // Initial state

  menuItems:PostCategory[]=[];

  constructor(
    private backendService:BackendService,
    private router:Router
  ) {

  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isExpanded = window.scrollY <= this.scrollOffset;
  }

  ngOnInit() {
    this.isExpanded = window.scrollY <= this.scrollOffset;
    this.fetchMenuItems();
  }

  fetchMenuItems() {
      this.backendService.getPostCategories().subscribe({
        next: (categories) => this.menuItems = categories,
        error: (err) => console.error(err),
        // complete: () => console.log('Completed fetching categories')
      });
  }

  goToPage(name:string, id:number): void {
    this.router.navigate([`/${RoutePaths.posts}`, id, name]);
  }
}
