import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';
import { NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-speedometer',
  standalone: true,
  imports: [
    NgStyle
  ],
  templateUrl: './speedometer.component.html',
  styleUrl: './speedometer.component.scss'
})
export class SpeedometerComponent implements OnInit {
  @Input('closed') closed: number;
  @Input('open') open: number;
  @Input('total') total: number;

  @ViewChild('pointer') pointer: ElementRef;
  private animationPlayer: AnimationPlayer;

  private animationComplete = false;

  constructor(
    private animationBuilder: AnimationBuilder
  ) {

  }

  ngOnInit(): void {
      
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    // If the pointer is visible on screen i.e. top is 50% of the screen height, animate the pointer
    const rect = this.pointer.nativeElement.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    if(!this.animationComplete && rect.top > 0 && rect.top < viewHeight * 0.5) {
      console.log('Animate speedometer');
      this.setSpeedometer();
    } else if(rect.top > viewHeight) {
      console.log('Reset speedometer');
      // If the pointer is out of screen, reset the pointer
      this.resetSpeedometer();
    }
  }

  animateSpeedometer(rotationZ:string, duration:number=2000) {
    /**
     * Calculate the rotation of the pointer based on the input metric. Rotate the point accordingly with animation
     * Source: https://stackblitz.com/edit/angular-animation-builder-pl9qkn?file=app%2Fapp.component.ts
    */
   if(this.animationPlayer) this.animationPlayer.destroy();
   
   const animationFactory = this.animationBuilder.build([
    animate(duration, style({ transform: rotationZ }))
   ]);
   this.animationPlayer = animationFactory.create(this.pointer.nativeElement);
  }


  setSpeedometer() {
    const rotationDegree = this.rotateSpeedometer(this.closed, this.total);
    this.animateSpeedometer(`rotateZ(${rotationDegree}deg)`);
    this.animationComplete = true;
    if(this.animationPlayer) this.animationPlayer.play();
  }

  resetSpeedometer() {
    this.animateSpeedometer('rotateZ(0deg)', 1);
    this.animationComplete = false;
    if(this.animationPlayer) this.animationPlayer.play();
  }

  rotateSpeedometer(closed:number, total:number):number {
    /**
     * This funtion receives the number of issue closed and the total number of issues raised.
     * The current rotation of pointer is 0 and it is pointed at the top of a speedometer.
     * When the percentage of issue completed is 0, the rotation will be -133deg. When the percentage is 100, the rotation will be 124deg.
     * Calculate the percentage of issue completed and rotate the pointer accordingly.
     */
    if(total === 0) return 0;
    const minMetric = 0;
    const maxMetric = 100;
    const metricRange = maxMetric - minMetric;

    const minDegree = -133;
    const maxDegree = 124;
    const degreeRange = maxDegree - minDegree;

    let percentage = (closed / total) * 100;
    const normalizedMetric = (percentage - minMetric) / metricRange;


    let rotation = minDegree + normalizedMetric * degreeRange;
    return rotation;

  }
}
