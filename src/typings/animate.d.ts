interface Animate {
    options: AnimateOptions;
    elements: Element[];
    initialised: boolean;
    verticalOffset: number;
    horizontalOffset: number;
    throttledEvent: () => void;
}
interface AnimateOptions {
    target?: string;
    animatedClass?: string;
    offset?: number[] | string;
    delay?: number;
    remove?: boolean;
    scrolled?: boolean;
    reverse?: boolean;
    onLoad?: boolean;
    onScroll?: boolean;
    onResize?: boolean;
    disableFilter?: () => boolean | void;
    callbackOnInit?: () => void;
    callbackOnInView?: () => void;
    callbackOnAnimate?: () => void;
}
declare class Animate implements Animate {
    constructor(options: AnimateOptions);
    private isAboveScrollPos;
    private getElementOffset;
    private isInView;
    private static isVisible;
    private static hasAnimated;
    private addAnimation;
    private removeAnimation;
    private static doCallback;
    private completeAnimation;
    removeEventListeners(): void;
    addEventListeners(): void;
    init(): void;
    kill(): void;
    render(onLoad?: boolean): void;
}
export default Animate;
