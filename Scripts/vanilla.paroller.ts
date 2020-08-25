/**
 * paroller.ts
 * Typescript port of paroller.js without jQuery.
 * Based on paroller.js (https://github.com/tgomilar/paroller.js)
 **/

'use strict';

const setDirection = {
    bgVertical: function (elem: HTMLElement, bgOffset: number) {
        elem.style.backgroundPosition = `center ${-bgOffset}px`;
        return elem;
    },
    bgHorizontal: function (elem: HTMLElement, bgOffset: number) {
        elem.style.backgroundPosition = `${-bgOffset}px center`;
        return elem;
    },
    vertical: function (elem: HTMLElement, elemOffset: number, transition: string, oldTransform?: string) {
        if(oldTransform === 'none') {
            oldTransform = '';
        }
        elem.style.transform = `translate(0, ${elemOffset}px) ${oldTransform}`;
        elem.style.transition = transition;
        elem.style.willChange = "transform";
        return elem;
    },
    horizontal: function (elem: HTMLElement, elemOffset: number, transition: string, oldTransform?: string) {
        if(oldTransform === 'none') {
            oldTransform = '';
        }
        elem.style.transform = `translate(${elemOffset}px, 0) ${oldTransform}`;
        elem.style.transition = transition;
        elem.style.willChange = "transform";
        return elem;
    }
};

const setMovement = {
    factor: function (elem: HTMLElement, width: number, options: Required<ParollerOptions>) {
        const dataFactor = elem.dataset.parollerFactor;
        const factor = (dataFactor) ? +dataFactor : options.factor;
        if (width < 576) {
            const dataFactorXs = elem.dataset.parollerFactorXs;
            const factorXs = (dataFactorXs) ? +dataFactorXs : options.factorXs;
            return (factorXs) ? factorXs : factor;
        }
        else if (width <= 768) {
            const dataFactorSm = elem.dataset.parollerFactorSm;
            const factorSm = (dataFactorSm) ? +dataFactorSm : options.factorSm;
            return (factorSm) ? factorSm : factor;
        }
        else if (width <= 1024) {
            const dataFactorMd = elem.dataset.parollerFactorMd;
            const factorMd = (dataFactorMd) ? +dataFactorMd : options.factorMd;
            return (factorMd) ? factorMd : factor;
        }
        else if (width <= 1200) {
            const dataFactorLg = elem.dataset.parollerFactorLg;
            const factorLg = (dataFactorLg) ? +dataFactorLg : options.factorLg;
            return (factorLg) ? factorLg : factor;
        } else if (width <= 1920) {
            const dataFactorXl = elem.dataset.parollerFactorXl;
            const factorXl = (dataFactorXl) ? +dataFactorXl : options.factorXl;
            return (factorXl) ? factorXl : factor;
        } else {
            return factor;
        }
    },
    bgOffset: function (offset: number, factor: number) {
        return Math.round(offset * factor);
    },
    transform: function (offset: number, factor: number, windowHeight: number, height: number) {
        return Math.round((offset - (windowHeight / 2) + height) * factor);
    }
};

const clearPositions = {
    background: function (elem: HTMLElement) {
        elem.style.backgroundPosition = "unset";
        return elem;
    },
    foreground: function (elem: HTMLElement) {
        elem.style.transform = "unset";
        elem.style.transition = "unset";
        return elem;
    }
};

export interface ParollerOptions {
    factor?: number
    factorXs?: number
    factorSm?: number
    factorMd?: number
    factorLg?: number
    factorXl?: number
    transition?: string
    type?: "background" | "foreground";
    direction?: "vertical" | "horizontal";
}

export default function paroller(targets: string | Node | Array<Node> | HTMLCollection | NodeList, options?: ParollerOptions) {
    const windowHeight = document.documentElement.clientHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // default options
    const mergedOptions: Required<ParollerOptions> = {
        factor: 0, // - to +
        factorXs: 0, // - to +
        factorSm: 0, // - to +
        factorMd: 0, // - to +
        factorLg: 0, // - to +
        factorXl: 0, // - to +
        transition: 'transform .1s ease', // CSS transition
        type: 'background', // foreground
        direction: 'vertical', // horizontal
        ...options
    };

    const targetList = typeof targets === 'string' ? document.querySelectorAll(targets)
        : targets instanceof Node ? [targets]
        : targets;

    for (const target of targetList) {
        if(!(target instanceof HTMLElement)) continue;

        const height = target.offsetHeight;
        const width = document.documentElement.clientWidth;
        const elemTop = target.getBoundingClientRect().top + document.body.scrollTop;
        let scrollOffset = 0;

        const withScrollOffset = function(scrollTop: number, transform: number) {
            if (! scrollTop) {
                scrollOffset = transform;
            }
            // console.log(`offset ${scrollOffset} => ${transform - scrollOffset}`)
            return transform - scrollOffset;
        }

        const dataType = target.dataset .parollerType;
        const dataDirection = target.dataset.parollerDirection;
        const dataTransition = target.dataset.parollerTransition;
        const oldTransform = target.style.transform;

        const transition = (dataTransition) ? dataTransition : mergedOptions.transition;
        const type = (dataType) ? dataType : mergedOptions.type;
        const direction = (dataDirection) ? dataDirection : mergedOptions.direction;
        const factor = 0;
        const bgOffset = setMovement.bgOffset(elemTop, factor);
        const transform = setMovement.transform(elemTop, factor, windowHeight, height);

        if (type === 'background') {
            if (direction === 'vertical') {
                setDirection.bgVertical(target, bgOffset);
            }
            else if (direction === 'horizontal') {
                setDirection.bgHorizontal(target, bgOffset);
            }
        }
        else if (type === 'foreground') {
            if (direction === 'vertical') {
                setDirection.vertical(target, transform, transition, oldTransform);
            }
            else if (direction === 'horizontal') {
                setDirection.horizontal(target, transform, transition, oldTransform);
            }
        }

        window.addEventListener('resize', () => {
            const scrolling = window.scrollY;
            const width = document.documentElement.clientWidth;
            const elemTop = target.getBoundingClientRect().top + document.body.scrollTop;
            const height = target.offsetHeight;
            const factor = setMovement.factor(target, width, mergedOptions);

            const bgOffset = Math.round(elemTop * factor);
            const transform = withScrollOffset(window.scrollY, Math.round((elemTop - (windowHeight / 2) + height) * factor));

            if (type === 'background') {
                clearPositions.background(target);
                if (direction === 'vertical') {
                    setDirection.bgVertical(target, bgOffset);
                }
                else if (direction === 'horizontal') {
                    setDirection.bgHorizontal(target, bgOffset);
                }
            }
            else if ((type === 'foreground') && (scrolling <= documentHeight)) {
                clearPositions.foreground(target);
                if (direction === 'vertical') {
                    setDirection.vertical(target, transform, transition);
                }
                else if (direction === 'horizontal') {
                    setDirection.horizontal(target, transform, transition);
                }
            }
        });

        const onLoadScroll = function () {
            const scrolling = window.scrollY;
            const scrollTop = window.scrollY;
            const factor = setMovement.factor(target, width, mergedOptions);
            const transform = withScrollOffset(scrollTop, Math.round(((elemTop - (windowHeight / 2) + height) - scrolling) * factor));

            if (type === 'background') {
                if (direction === 'vertical') {
                    setDirection.bgVertical(target, bgOffset);
                }
                else if (direction === 'horizontal') {
                    setDirection.bgHorizontal(target, bgOffset);
                }
            }
            else if ((type === 'foreground') && (scrolling <= documentHeight)) {
                if (direction === 'vertical') {
                    setDirection.vertical(target, transform, transition, oldTransform);
                }
                else if (direction === 'horizontal') {
                    setDirection.horizontal(target, transform, transition, oldTransform);
                }
            }
        };

        window.addEventListener('load', onLoadScroll);
        window.addEventListener('scroll', onLoadScroll);
    }
}
