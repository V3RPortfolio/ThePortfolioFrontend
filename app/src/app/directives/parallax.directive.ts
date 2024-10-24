import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { ParallaxDirectiveArgument, ParentFlexDirectionColumn } from './parallax.model';

@Directive({
    selector: '[appParallax]',
    standalone: true
})
export class ParallaxDirective implements OnInit {
  @Input('appParallax') args:ParallaxDirectiveArgument={
    speed: 1,
    direction: 'vertical',
  };
  
  scrollStartOffset = 20;
  constructor(
    private element: ElementRef
  ) { 
    
  }

  ngOnInit(): void {
    let $element = this.element.nativeElement as HTMLElement;

    // Add class name to the parent and child elements
    $element!.classList.add('parallax-child');  
    $element.parentElement!.classList.add('parallax-parent');

    if(this.args && this.args.enabled !== false) this.args.enabled = true;

    $element.parentElement!.classList.add(this.args.parentFlexDirection || ParentFlexDirectionColumn)
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    let $element = this.element.nativeElement as HTMLElement;
    let speed = this.args.speed || 1;

    let top = $element.getBoundingClientRect().top;
    let nextTop = - ((window.scrollY-top) * speed);
    if(nextTop > 0) nextTop = 0;
    if(Math.abs(window.scrollY) > top - this.scrollStartOffset && (!this.args.maxTop || -this.args.maxTop <= top)) $element!.style.top = this.args.enabled ? nextTop + 'px' : '';
    
  }

}
