import { Subject } from "rxjs";

export class ScrollCreditService {
    private _animationSpeed:number = 1; //px per second
    private _initialPosition:number = 0;
    private _finalPosition:number = 0;
    private _animationEnded:boolean = false;
    private _debugEnabled:boolean = true;
    private _animationStopped:Subject<boolean> = new Subject<boolean>();
    

    constructor(
        private _container:HTMLElement,
        private _parent:HTMLElement,
        {
            debug=true
        }:{
            debug?:boolean
        }={}
    ) {
        this._debugEnabled = debug;
        this._initialPosition = this._parent.clientHeight || 0;

        this._container.style.transform = `translateY(${this._initialPosition}px)`;
    }

    private debug(msg:any) {
        if(this._debugEnabled) console.log(msg);
    }

    private updateDistance() {
        this._finalPosition = -this._container.clientHeight || 0;
    }

    private animateContainer() {
        // Move the container up by the speed offset
        let currentContainerTransform = this._container.style.transform;
        let currentContainerY = currentContainerTransform.length > 0 ? parseFloat(currentContainerTransform.split("(")[1].split("px")[0]) : 0;
        let newContainerY = currentContainerY - this._animationSpeed;
        this._container.style.transform = `translateY(${newContainerY}px)`;
        
    }

    animate() {
        // this.debug("Animating");
        if(!this._container || this._animationEnded) return;
        const currentContainerTop = this._container.getBoundingClientRect().top;
        this.debug("Current container top: " + currentContainerTop + " Final position: " + this._finalPosition);
        if(currentContainerTop < this._finalPosition) {
            this._animationEnded = true;
            this._animationStopped.next(true);
            this._animationStopped.complete();
            return;
        }
        this.updateDistance();
        this.animateContainer();
        requestAnimationFrame(() => {
            this.animate();
        });
    }

    resetContainer() {
        this._container.style.transform = '';
    }

    get hasStopped(): Subject<boolean> {
        return this._animationStopped;
    }

}

export class FadeCreditService {
    private _animationDuration:number = 1000;
    private _debugEnabled:boolean = true;


    constructor(
        private _prefixContainer:HTMLElement,
        private _mainContentContainer:HTMLElement,
        private _suffixListContainer:HTMLElement,
        private _showContainerClass:string,
        private _fadeInAnimationClass:string,
        private _fadeOutAnimationClass:string,
        {
            debug=true,
            animationDuration=1000
        }:{
            debug?:boolean,
            animationDuration?:number
        }={}
    ) {
        this._debugEnabled = debug;
        this._animationDuration = animationDuration;
    }

    private debug(msg:any) {
        if(this._debugEnabled) console.log(msg);
    }

    private async wait(time:number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, time);
        });
    }

    private async animatePrefix() {
        if(!this._prefixContainer) return;
        this.debug("Animating prefix");
        this._prefixContainer.classList.add(this._showContainerClass);
        this._prefixContainer.classList.add(this._fadeInAnimationClass);
        await this.wait(this._animationDuration);
        this._prefixContainer.classList.remove(this._fadeInAnimationClass);
        this._prefixContainer.classList.add(this._fadeOutAnimationClass);
        await this.wait(this._animationDuration);
        this._prefixContainer.classList.remove(this._fadeOutAnimationClass);
        this._prefixContainer.classList.remove(this._showContainerClass);
    }

    private async animateMainContent() {
        // Divie the title and subtitle into separate animations later
        if(!this._mainContentContainer) return;
        this.debug("Animating main content");
        this._mainContentContainer.classList.add(this._showContainerClass);
        this._mainContentContainer.classList.add(this._fadeInAnimationClass);
        await this.wait(this._animationDuration);
        this._mainContentContainer.classList.remove(this._fadeInAnimationClass);
        this._mainContentContainer.classList.add(this._fadeOutAnimationClass);
        await this.wait(this._animationDuration);
        this._mainContentContainer.classList.remove(this._fadeOutAnimationClass);
        this._mainContentContainer.classList.remove(this._showContainerClass);
    }

    private async animateSuffix() {
        if(!this._suffixListContainer) return;
        this.debug("Animating suffix");
        const children = this._suffixListContainer.children;
        if(!children) return;
        for(let i=0; i<children.length; i++) {
            const child = children[i];
            if(!child) continue;
            child.classList.add(this._showContainerClass);
            child.classList.add(this._fadeInAnimationClass);
            await this.wait(this._animationDuration);
            child.classList.remove(this._fadeInAnimationClass);
            child.classList.add(this._fadeOutAnimationClass);
            await this.wait(this._animationDuration);
            child.classList.remove(this._fadeOutAnimationClass);
            child.classList.remove(this._showContainerClass);
        }
    }

    async animate() {
        await this.animatePrefix();
        await this.animateMainContent();
        await this.animateSuffix();
    }
}