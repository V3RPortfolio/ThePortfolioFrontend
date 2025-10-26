import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatButton } from '@angular/material/button';
import { WPBackendService } from '../../services/wpbackend.service';
import { PostCategory } from '../../interfaces/backend/category.interface';
import { Router } from '@angular/router';
import { RoutePaths } from '../../app.constants';
import { NgClass } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';

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
    imports: [
      MatButton, 
      MatToolbar,
      MatSidenavModule,
      MatIcon,
      NgClass
    ],
})
export class HeaderComponent implements OnInit {
  @ViewChild('navbar') navbar: ElementRef;
  @ViewChild('slidingMenu') slidingMenu: ElementRef;
  
  showMenu = false;
  hasScrolled:boolean=false;

  menuItems:PostCategory[]=[];

  creditsRoute=`/${RoutePaths.credits}`;
  aboutRoute=`/${RoutePaths.about}`;
  loginRoute=`/${RoutePaths.login}`;

  constructor(
    private backendService:WPBackendService,
    private router:Router
  ) {

  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.hasScrolled = window.scrollY > 0;
  }

  ngOnInit() {
    this.onWindowScroll();
    this.fetchMenuItems();
  }

  fetchMenuItems() {
      this.backendService.getPostCategories().subscribe({
        next: (categories) => this.menuItems = categories,
        error: (err) => console.error(err),
        // complete: () => console.log('Completed fetching categories')
      });
  }

  gotToPost(name:string, id:number): void {
    this.router.navigate([`/${RoutePaths.posts}`, id, name]);
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
    if(this.showMenu) {
      // Add show class to slidingMenu
      this.slidingMenu.nativeElement.classList.remove("hidden");
      this.slidingMenu.nativeElement.classList.add('show');
      this.slidingMenu.nativeElement.classList.remove('hide');
    } else {
      // Add hide class to slidingMenu
      this.slidingMenu.nativeElement.classList.add('hide');
      this.slidingMenu.nativeElement.classList.remove('show');
      setTimeout(() => {
        this.slidingMenu.nativeElement.classList.add("hidden");
      }, 300);
    }
  }
}
