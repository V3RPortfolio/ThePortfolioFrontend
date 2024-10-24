import { NgFor } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { WordpressBannerComponent } from '../wordpress-banner/wordpress-banner.component';

@Component({
  selector: 'app-home-banners',
  templateUrl: './home-banners.component.html',
  styleUrl: './home-banners.component.scss',
  standalone: true,
  imports: [
    NgFor,
    WordpressBannerComponent
  ]
})
export class HomeBannersComponent implements OnInit, AfterViewInit {
  @ViewChild('homeBannerContainer') homeBannerContainer: ElementRef;
  @ViewChild('frontendExperienceTextContainer') frontendExperienceTextContainer: ElementRef;
  @ViewChild('feTitle') feTitle: ElementRef;
  @ViewChild('feSubtitle') feSubtitle: ElementRef;
  @ViewChild('feImage') feImage: ElementRef;

  animateTriggerClass:string = "crossed";
  initialLeft = -200;

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    //this.testGl();
  }

  // Frontend Experience section
  private animateFrontendExperienceText(firstAnimation: number, top:number) {
    
    if (top < firstAnimation && !this.feTitle.nativeElement.classList.contains(this.animateTriggerClass)) {
      this.feTitle.nativeElement.classList.add(this.animateTriggerClass);
      setTimeout(() => {
        this.feSubtitle.nativeElement.classList.add(this.animateTriggerClass);
      }, 300);
    } 
    // else if the container is out of viewport remove the class
    else if(top > window.innerHeight) {
      this.feTitle.nativeElement.classList.remove(this.animateTriggerClass);
      this.feSubtitle.nativeElement.classList.remove(this.animateTriggerClass);
    }
    // Move the image along x axis by the amount of scroll. Change the value of left
    // to adjust the speed of the image
    this.feImage.nativeElement.style.left = `${-top/3}px`;
  }

  private animageFrontendExperienceImage(firstAnimation: number, top:number) {
    const animationEnd =  window.innerHeight - (70/100 * window.innerHeight);
    const newLeft = (-this.initialLeft * (firstAnimation - top) / (firstAnimation - animationEnd)) + this.initialLeft;


    if(top < firstAnimation) { 
      if(newLeft > this.initialLeft && newLeft <= 0) this.feImage.nativeElement.style.left = `${newLeft}px`;
      else if(newLeft > 0) this.feImage.nativeElement.style.left = `0px`;
      else if(newLeft < this.initialLeft) this.feImage.nativeElement.style.left = `${this.initialLeft}px`;
    }

  }


  @HostListener('window:scroll', ['$event'])
  animateFrontendExperience() {
    const top = this.frontendExperienceTextContainer.nativeElement.getBoundingClientRect().top;
    // Animate the text in banner by fading in
    const firstAnimation = window.innerHeight - (5/100 * window.innerHeight);
    this.animateFrontendExperienceText(firstAnimation, top);
    this.animageFrontendExperienceImage(firstAnimation, top);
  }

  

}
