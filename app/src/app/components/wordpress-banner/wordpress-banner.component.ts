import { NgClass, NgFor } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three-stdlib';
import { asteroidModelPath, ExternalModels, WordpressBannerAnimationService } from './wordpress-banner-animation.service';


export class Dust {
  constructor(
    public radius: number,
    public particle: THREE.Object3D,
    public initialPosition: THREE.Vector3,
  ) {

  }
}

export class ObjectTexture {
  private _path:string;
  private _texture:THREE.Texture|null = null;
  constructor(
    private tPath,
  ) {
    this._path = tPath;
    this._texture = new THREE.Texture();
    this.loadTexture();
  }

  get path():string {
    return this._path;
  }

  get texture():THREE.Texture|null {
    return this._texture;
  }

  private loadTexture() {
    const loader = new THREE.TextureLoader();
    loader.load(this._path, (texture) => {
      this._texture.copy(texture);
      this._texture.repeat.set(1, 0.7);
      this._texture.offset.set(0, 0.15);
      
      
      this._texture.needsUpdate = true;
    });
  }


}

@Component({
  selector: 'app-wordpress-banner',
  templateUrl: './wordpress-banner.component.html',
  styleUrl: './wordpress-banner.component.scss',
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    FormsModule
  ]
})
export class WordpressBannerComponent implements AfterViewInit, OnInit {

  @ViewChild('mainWrapper') _mainWrapper: ElementRef;
  @ViewChild('wordpressText') _wordpressText: ElementRef;
  @ViewChild('wordpressHeader') _wordpressHeader: ElementRef;
  @ViewChild('wordpressTagline') _wordpressTagline: ElementRef;
  debugEnabled = false;
  sceneBackgroundColor = 0xefefef;
  cameraX = "0";
  cameraY = "0";
  cameraZ = "0";
  showText:boolean = false;


  animationService:WordpressBannerAnimationService;
  externalModels:ExternalModels = {
    asteroid: null
  };

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.loadExternalModels().then(() => {
      this.animationService = new WordpressBannerAnimationService(
        this._mainWrapper.nativeElement,
        this.externalModels,
        {
          debugEnabled: this.debugEnabled,
          sceneBackgroundColor: this.sceneBackgroundColor
        }
      );
      this.animationService.configureScene();
      this.animationService.handleAnimation();
    });

  }

  private async loadExternalModels() {
    const loader = new GLTFLoader();
    try {
      let gltf = await loader.loadAsync(asteroidModelPath);
      if(gltf.scene && gltf.scene.children.length > 0) {
        this.externalModels.asteroid = gltf.scene.children[0];
      }
    } catch(e) {
      console.error(e);
    }
    
  }

  adjustTextPosition() {
    const posiiton = this.animationService.planetPositionRelativeToCanvas()
    this._wordpressText.nativeElement.style.left = `${posiiton[0] + 30}px`;
    this._wordpressText.nativeElement.style.top = `${posiiton[1] - 30}px`;

  }

  adjustTextSize() {
    const planetSize = this.animationService.getPlanetSizeOnScreen();
    if(planetSize > 0) {
      
      this._wordpressHeader.nativeElement.style.fontSize = `${planetSize * 0.08}px`;
      this._wordpressTagline.nativeElement.style.fontSize = `${planetSize * 0.03}px`;
    }
  }

  
  @HostListener('window:resize', ['$event'])
  updateOnWindowResize() {
    if(!this.animationService || !this.animationService.configured) return;
    if(!this.debugEnabled) this.animationService.handleWindowResize();
    this.adjustTextPosition();
  }

  // Listen for scroll
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    if(!this.animationService || !this.animationService.configured) return;
    if(!this.debugEnabled) this.animationService.handleScrollEvent();
    else {
      this.cameraX = this.animationService.cameraX.toFixed(2);
      this.cameraY = this.animationService.cameraY.toFixed(2);
      this.cameraZ = this.animationService.cameraZ.toFixed(2);
    }
    const show = this.animationService.hasCameraMovementEnded;
    if(show) this.adjustTextSize();
    this.showText = show;
    this.adjustTextPosition();
  }
}
