import { ElementRef } from '@angular/core';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';


export interface SceneAction {
    startFrame: number;
    endFrame: number;
    playDuration: number;
}

export interface SceneObjectMetadata {
    name: string;
    filePath: string;
    actions: {[key:string]: SceneAction};
    defaultAction?: string | null;
}

export interface SceneObject {
    metadata?: SceneObjectMetadata|null; 
    model: THREE.Object3D;
    clock: THREE.Clock;
    mixer?: THREE.AnimationMixer|null;
    
    getSize(): {x: number, y: number, z: number};
    getPosition(): {x: number, y: number, z: number};
    getRotation(): {x: number, y: number, z: number};
    setPosition(x: number, y: number, z: number): void;
    setScale(x: number, y: number, z: number): void;
    setRotation(x: number, y: number, z: number): void;
    toggleObjectVisibility(name:string, hide:boolean): void;
    addAnimations(gltf: GLTF): void;
    getAnimationNames(): string[];
    playAnimation(): void;
    addToScene(scene: THREE.Scene): void;
}


export interface SceneCameraInfo {
    position: THREE.Vector3;
    lookAt?: THREE.Vector3;
    fieldOfView: number;
    far: number;
    near: number;
}

export interface SceneLightInfo {
    color:THREE.ColorRepresentation;
    position: THREE.Vector3;
    intensity: number;
}

export interface SceneRenderer {
    wrapper: ElementRef;
    backgroundColor: THREE.ColorRepresentation;
    backgroundOpacity: number;
    mainCamera: THREE.PerspectiveCamera;
    characters: {[key:string]: SceneObject};
    mainLight: THREE.AmbientLight;
    clock: THREE.Clock;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;

    animate():void;
    updateWindowSize(newSize:{width:number, height:number}|null): void;
    start(): void;
}
