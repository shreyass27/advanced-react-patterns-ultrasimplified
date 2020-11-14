import React, { useCallback, useLayoutEffect, useState, useRef, useEffect } from 'react';
import mojs from 'mo-js';
import styles from './index.css';

const Initial_State = {
    count: 0,
    countTotal: 200,
    isClicked: false
};
const MAX_USER_CLAP = 50;

// Custom Hook
const useClapAnimation = ({
    clapEl,
    clapCountEl,
    countTotalEl
}) => {
    const [animationTimeLne, setAnimationTimeLne] = useState(() => new mojs.Timeline());

    useLayoutEffect(() => {
        if (!clapEl || !clapCountEl || !countTotalEl) {
            return;
        }

        const tlDuration = 300;
        const scaleButton = new mojs.Html({
            el: clapEl,
            duration: tlDuration,
            scale: { 1.3: 1 },
            easing: mojs.easing.ease.out
        });
        if (typeof clapEl === 'string') {
            const clap = document.getElementById('clap');
            clap.style.transform = `scale(1,1)`;
        } else {
            clapEl.style.transform = `scale(1,1)`;
        }

        const countAnimate = new mojs.Html({
            el: clapCountEl,
            opacity: { 0: 1 },
            duration: tlDuration,
            y: { 0: -30 }
        }).then({
            opacity: { 1: 0 },
            delay: tlDuration / 2,
            duration: tlDuration / 3,
            y: -80
        });

        const countTotalAnimate = new mojs.Html({
            el: countTotalEl,
            duration: tlDuration,
            opacity: { 0: 1 },
            delay: (3 * tlDuration) / 2,
            y: { 0: -3 }
        });

        const triangleBurst = new mojs.Burst({
            parent: clapEl,
            radius: { 50: 95 },
            count: 5,
            angle: 30,
            children: {
                shape: 'polygon',
                radius: { 6: 0 },
                stroke: 'rgba(211, 54, 0, 0.5)',
                strokeWidth: 2,
                angle: 210,
                delay: 30,
                speed: 0.2,
                duration: tlDuration,
                easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
            }
        });

        const circleBurst = new mojs.Burst({
            parent: clapEl,
            radius: { 50: 75 },
            count: 5,
            angle: 25,
            duration: tlDuration,
            children: {
                shape: 'circle',
                fill: 'rgba(149, 165, 166, 0.5)',
                delay: 30,
                speed: 0.2,
                radius: { 3: 0 },
                easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
            }
        });

        const newAnimationTimeLne = animationTimeLne.add([scaleButton, countTotalAnimate, countAnimate, triangleBurst, circleBurst])
        setAnimationTimeLne(newAnimationTimeLne)
    }, [clapEl,
        clapCountEl,
        countTotalEl])

    return animationTimeLne;
}

const useDOMRef = () => {
    const [DOMRef, setRefsState] = useState({});

    const setRef = useCallback(node => {
        setRefsState(prevState => ({
            ...prevState,
            [node.dataset.refkey]: node
        }))
    }, []);

    return [DOMRef, setRef];
}

const useClapState = (initialState) => {
    const [clapState, setClapState] = useState(initialState);

    const updateClapState = useCallback(() => {
        setClapState(({ count, countTotal }) => ({
            count: Math.min(MAX_USER_CLAP + initialState.count, count + 1),
            countTotal: Math.min(MAX_USER_CLAP + initialState.countTotal, countTotal + 1),
            isClicked: true
        }));
    }, [setClapState]);

    const togglerProps = {
        onClick: updateClapState,
        'aria-pressed': clapState.isClicked
    }

    const counterProps = {
        count: clapState.count,
        'aria-valuemax': MAX_USER_CLAP,
        'aria-valuemin': 0,
        'aria-valuenow': clapState.count
    }

    return {
        clapState,
        updateClapState,
        togglerProps,
        counterProps
    };
}

const useEffectAfterMount = (callback, dependencies) => {
    // useEffect Will not be called on mount 
    const componentFirstMount = useRef(true);
    useEffect(function () {
        console.log('useEffectAfterMount componentFirstMount.current', componentFirstMount.current)
        if (!componentFirstMount.current) {
            return callback();
        }
        componentFirstMount.current = false
    }, [...dependencies]);
};

const MediumClap = () => {
    const [clapState, updateClapState] = useClapState(Initial_State);
    const { count, countTotal, isClicked } = clapState;

    const [{ clapRef, clapCountRef, countTotalRef }, setRef] = useDOMRef({});
    const animationTimeLne = useClapAnimation({
        clapEl: clapRef,
        clapCountEl: clapCountRef,
        countTotalEl: countTotalRef
    })

    // useEffect Will not be called on mount 
    useEffectAfterMount(function () {
        animationTimeLne.replay()
    }, [count]);

    return <button ref={setRef}
        data-refkey='clapRef'
        className={styles.clap}
        onClick={updateClapState}>
        <ClapIcon isClicked={isClicked} />
        <ClapCount setRef={setRef} count={count} />
        <CountTotal setRef={setRef} countTotal={countTotal} />
    </button>
};

const ClapContainer = ({ children, setRef, onClick, ...restProps }) => {
    return <button ref={setRef}
        className={styles.clap}
        onClick={onClick}
        {...restProps}>
        {children}
    </button>
}

const ClapCount = ({ count, setRef, ...restProps }) => {
    return <span ref={setRef} className={styles.count} {...restProps}>
        + {count}
    </span>
};

const CountTotal = ({ countTotal, setRef, ...restProps }) => {
    return <span ref={setRef} className={styles.total} {...restProps}>
        {countTotal}
    </span>
}

const ClapIcon = ({ isClicked }) => {
    return <span>
        <svg id="clap-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-549 338 100.1 125"
            className={`${styles.icon} ${isClicked && styles.checked}`}>
            <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z" />
            <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9" />
        </svg>
    </span>
}

const Usage = () => {
    const { clapState, togglerProps, counterProps } = useClapState(Initial_State)

    const { count, countTotal, isClicked } = clapState;

    const [{ clapRef, clapCountRef, countTotalRef }, setRef] = useDOMRef({});
    const animationTimeLne = useClapAnimation({
        clapEl: clapRef,
        clapCountEl: clapCountRef,
        countTotalEl: countTotalRef
    })

    // useEffect Will not be called on mount
    useEffectAfterMount(function () {
        animationTimeLne.replay()
    }, [count]);

    return <ClapContainer setRef={setRef}
        data-refkey='clapRef'
        {...togglerProps}>
        <ClapIcon isClicked={isClicked} />
        <ClapCount setRef={setRef}
            data-refkey='clapCountRef' count={count} {...counterProps} />
        <CountTotal setRef={setRef}
            data-refkey='countTotalRef' countTotal={countTotal} />
    </ClapContainer>
}

export default Usage;