import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CreditGroup, credits } from './credits.model';
import { NgFor, NgIf } from '@angular/common';
import { FadeCreditService, ScrollCreditService } from './credits.service';


@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.scss',
  standalone: true,
  imports: [
    NgIf,
    NgFor
  ],
})
export class CreditsComponent implements AfterViewInit, OnInit {
  // Credit related info
  creditsInfo: CreditGroup[] = credits;
  currentCreditIndex: number = 0;
  currentCreditInfo: CreditGroup;

  // Container related info
  @ViewChild('mainBody') mainBody: any;
  @ViewChild('prefixNote') prefixNote: any;
  @ViewChild('suffixNote') suffixNote: any;
  @ViewChild('mainContent') mainContent: any;
  @ViewChild('creditGroup') creditGroup: any;

  // Constants
  showMainClass: string = "show";
  fadeInClass: string = "fadeIn";
  fadeOutClass: string = "fadeOut";
  scrollUpClass: string = "scrollUp";
  scrollerAddedClass:string = "scrolling";
  debugEnabled: boolean = false;
  animationDuration: number = 2000;

  constructor() {
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    for(let credit of this.creditsInfo) {
      if(credit.credits && credit.credits.length > 0) {
        credit.credits.sort((a, b) => {
          if(a.title < b.title) return -1;
          if(a.title > b.title) return 1;
          return 0;
        });
      }
    }
    this.showNextCredit().then(() => {
      this.debug("Started animation");
    });
  }

  debug(msg:any) {
    if(this.debugEnabled) console.log(msg);
  }


  getMainBodyStartAnimation(creditInfo:CreditGroup): string {
    if(!creditInfo || !creditInfo.credits || creditInfo.credits.length == 0) return "";
    if(creditInfo.credits.length == 1) return this.fadeInClass;
    return this.scrollUpClass;
  }

  getMainBodyEndAnimation(creditInfo:CreditGroup): string {
    if(!creditInfo || !creditInfo.credits || creditInfo.credits.length == 0) return "";
    return this.fadeOutClass;
  }

  async wait (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrollContent(element:HTMLElement) {
    if(!element) {
      this.moveToNextCredit();
      this.showNextCredit();
      return;
    }
    const creditAnimator = new ScrollCreditService(element, this.mainBody.nativeElement, {debug: this.debugEnabled});
    element.classList.add(this.scrollerAddedClass);
    creditAnimator.hasStopped.subscribe((stopped) => {
      if(stopped) {
        element.classList.remove(this.scrollerAddedClass);
        creditAnimator.resetContainer();
        this.moveToNextCredit();
        this.showNextCredit();
      }
    });
    creditAnimator.animate();
  }


  private async moveToNextCredit(wait:number|null=null) {
    this.currentCreditIndex = (this.currentCreditIndex + 1)%this.creditsInfo.length;
    this.currentCreditInfo = this.creditsInfo[this.currentCreditIndex];
    if(wait && wait > 0) {
      await this.wait(wait);
    }
  }

  async showNextCredit() {
    if(!this.creditsInfo || this.currentCreditIndex >= this.creditsInfo.length) return;
    if(!this.creditsInfo[this.currentCreditIndex].show) {
      this.debug("Skipping credit");
      this.debug(this.creditsInfo[this.currentCreditIndex]);
      await this.moveToNextCredit();
      // this.showNextCredit();
      return;
    }
    this.currentCreditInfo = this.creditsInfo[this.currentCreditIndex];
    if(!this.currentCreditInfo) return;

    // Start animation
    this.debug("Updated current credit");
    await this.wait(100);
    const element = this.mainBody.nativeElement as HTMLElement;
    this.debug("Retrieved main body element");
    this.debug(element);
    if(!element) return;

    // Show main body
    this.debug("Showing main body");
    element.classList.add(this.showMainClass);    
    const startAnimation = this.getMainBodyStartAnimation(this.currentCreditInfo);
    const endAnimation = this.getMainBodyEndAnimation(this.currentCreditInfo);
    this.debug("Start animation: " + startAnimation + " and end animation: " + endAnimation);

    if(startAnimation == this.fadeInClass) {
      await new FadeCreditService(
        this.prefixNote ? this.prefixNote.nativeElement as HTMLElement : null,
        this.mainContent.nativeElement as HTMLElement,
        this.suffixNote ? this.suffixNote.nativeElement as HTMLElement : null,
        this.showMainClass,
        startAnimation,
        endAnimation,
        {
          debug: this.debugEnabled,
          animationDuration: this.animationDuration
        }
      ).animate();
    } else {
      let contentElement = this.creditGroup.nativeElement as HTMLElement;
      // await this.showContent(contentElement, startAnimation, endAnimation, 20000);
      await this.scrollContent(contentElement);
      return;
    }

    // Hide main body
    this.debug("Hiding main body");
    element.classList.remove(this.showMainClass);

    // Move to next credit
    await this.moveToNextCredit();
    this.showNextCredit();
    
  }
}
