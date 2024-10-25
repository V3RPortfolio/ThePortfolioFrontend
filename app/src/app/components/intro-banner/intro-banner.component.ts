import { NgClass, NgFor } from '@angular/common';
import { AfterViewInit, Component, ElementRef, output, Output, ViewChild } from '@angular/core';
import { EventEmitter } from 'stream';
import { SessionManager } from '../../services/session.service';
import { SocialLinksComponent } from '../social-links/social-links.component';

@Component({
  selector: 'app-intro-banner',
  templateUrl: './intro-banner.component.html',
  styleUrl: './intro-banner.component.scss',
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    SocialLinksComponent
  ],
  providers: [SessionManager]
})
export class IntroBannerComponent implements AfterViewInit {
  bannerContents = [
    {
      title: "Hello, I'm Zohair Mehtab",
      contents: [
        "I am a programmer with a passion for exploring computing devices - both, brain and machines.",
        "I am a full-stack developer and machine learning enthusiast with extensive experience across web development, cloud infrastructure, embedded systems, and research.",
      ]
    }, {
      title: "Explore the Code that Powers My World",
      contents: [
        "This is more than just a portfolio - it's an ecosystem of my skills and passions.",
        "Dive into the code behind interactive web experiences and explore the architecture of microservices.",
        "Every project is open-source, every component tells a story, and every line of code is an invitation to collaborate.",
      ]
    }
  ];
  minTypingSpeed = 20;
  maxTypingSpeed = 80;
  newParagraphPause = 3000;
  contentFadeoutDuration = 1000;
  totalContents = 0;
  currentlyDisplayedContents = 0;
  fadeOutClass = "fade";
  doesSessionExist:boolean = false;


  @ViewChild('bannerTitle') bannerTitle:ElementRef;
  @ViewChild('bannerContent') bannerContent:ElementRef;
  hidePanel = output<boolean>();
  

  currentLoadingComplete:String = "0%";
  currentBannerIndex:number = 0;
  typingInHeader:boolean = true;

  constructor(
    private sessionManager: SessionManager
  ) {
    this.totalContents = this.bannerContents.reduce((acc, val) => acc + val.contents.length, 0) + this.bannerContents.length;
    this.doesSessionExist = this.sessionManager.sessionExists;
  }

  ngAfterViewInit(): void {
      this.animateText();
  }

  private async sleep(duration:number=2000) {
    await new Promise(r => setTimeout(r, duration));
  }

  private updateProgressbar() {
    if(this.currentlyDisplayedContents >= this.totalContents) return;
    this.currentlyDisplayedContents += 1;
    this.currentLoadingComplete = Math.floor((this.currentlyDisplayedContents / this.totalContents) * 100).toString() + "%";
  }

  private async typeHeading(content:string) {
    for(let i=0; i < content.length; i++) {
      this.bannerTitle.nativeElement.innerHTML += content[i];
      const speed = Math.random() * (this.maxTypingSpeed - this.minTypingSpeed) + this.minTypingSpeed;
      await this.sleep(speed);
    }
  }

  private async typeContent(content:string) {
    for(let i=0; i < content.length; i++) {
      this.bannerContent.nativeElement.innerHTML += content[i];
      const speed = Math.random() * (this.maxTypingSpeed - this.minTypingSpeed) + this.minTypingSpeed;
      await this.sleep(speed);
    }
  
  }
  private async animateHeading() {
      this.bannerContent.nativeElement.innerHTML = "";
      this.bannerTitle.nativeElement.innerHTML = "";
      this.typingInHeader = true;
      await this.sleep(500);

      await this.typeHeading(this.bannerContents[this.currentBannerIndex].title);
      this.updateProgressbar();
      await this.sleep(this.newParagraphPause);
      this.typingInHeader = false;
  }

  private async animateContent() {
    // Type content
    for(let i=0; i < this.bannerContents[this.currentBannerIndex].contents.length; i++) {
      this.bannerContent.nativeElement.innerHTML = "";
      this.bannerContent.nativeElement.classList.remove(this.fadeOutClass);
      await this.typeContent(this.bannerContents[this.currentBannerIndex].contents[i]);
      await this.sleep(this.newParagraphPause);
      if(i + 1 < this.bannerContents[this.currentBannerIndex].contents.length - 1) {
        this.bannerContent.nativeElement.classList.add(this.fadeOutClass);
      }
      this.updateProgressbar();
      this.currentLoadingComplete = Math.floor((this.currentlyDisplayedContents / this.totalContents) * 100).toString() + "%";
      await this.sleep(this.contentFadeoutDuration * 1.01);
    }
  }

  async animateText() {
    await this.animateHeading();
    await this.animateContent();

    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.bannerContents.length;
    if(this.currentlyDisplayedContents >= this.totalContents) {
      this.currentLoadingComplete = "100%";
      await this.sleep(500);
      this.hide();
    }
    this.animateText();
  }

  hide() {
    this.hidePanel.emit(true);
  }

}
