import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeInStyle = [{opacity: 0}, {opacity: 1}];
export const enterFromRightStyle = [{paddingLeft: '40px'}, {paddingLeft: '0'}];
export const enterFromlLeftStyle = [{paddingRight: '40px'}, {paddingRight: '0'}];


export function fadeIn(duration:number=1000) {
    return trigger('fadeIn', [
        state('void', style({ ...fadeInStyle[0] })),
        transition(':enter', [
            animate(duration, style({ ...fadeInStyle[1] }))
        ])
    ]);
}


export function fadeInAndEnter(key:string, duration, initialStyle:{[key:string]:any}, finalStyle:{[key:string]:any}) {
  initialStyle = initialStyle || {};
    initialStyle = {...initialStyle, ...fadeInStyle[0]};
    finalStyle = finalStyle || {};
    finalStyle = {...finalStyle, ...fadeInStyle[1]};
    return trigger(key, [
        state('void', style(initialStyle)),
        transition(':enter', [
            animate(duration, style(finalStyle))
        ])
    ]);
}
export function fadeInEnterFromRight(duration:number=1000, initialStyle:{[key:string]:any}={paddingLeft: '40px'}, finalStyle:{[key:string]:any}={paddingLeft: '0'}) {
    return fadeInAndEnter('fadeInEnterFromRight', duration, initialStyle, finalStyle);
}

export function fadeInEnterFromLeft(duration:number=1000, initialStyle:{[key:string]:any}={paddingLeft: '40px'}, finalStyle:{[key:string]:any}={paddingLeft: '0'}) {
    return fadeInAndEnter('fadeInEnterFromLeft', duration, initialStyle, finalStyle);
}