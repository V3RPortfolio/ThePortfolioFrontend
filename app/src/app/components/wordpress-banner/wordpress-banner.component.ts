import { NgClass, NgFor } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three-stdlib';
import { asteroidModelPath, ExternalModels, WordpressBannerAnimationService } from './wordpress-banner-animation.service';
import { wordpressRepoUrl } from '../../app.constants';
import { MatButton } from '@angular/material/button';


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
    FormsModule,
    MatButton
  ]
})
export class WordpressBannerComponent implements AfterViewInit, OnInit {

  @ViewChild('mainWrapper') _mainWrapper: ElementRef;
  debugEnabled = false;
  sceneBackgroundColor = 0xefefef;
  cameraX = "0";
  cameraY = "0";
  cameraZ = "0";
  showText:boolean = false;
  wordpressRepoUrl = wordpressRepoUrl;
  isWebGlAvailable = true;


  animationService:WordpressBannerAnimationService;
  externalModels:ExternalModels = {
    asteroid: null
  };

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.isWebGlAvailable = this.isWebGLAvailable();
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

  private isWebGLAvailable() {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch(e) {
      return false;
    }
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

  
  @HostListener('window:resize', ['$event'])
  updateOnWindowResize() {
    if(!this.animationService || !this.animationService.configured) return;
    if(!this.debugEnabled) this.animationService.handleWindowResize();
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
    this.showText = show;
  }

  viewPage(page:string) {
    window.open(page, "_blank");
  }
}
