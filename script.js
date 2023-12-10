/** DOMs */
const headerBackground_DOM = document.querySelector('.header-background');
const footerBackground_DOM = document.querySelector('.footer-background');
const profilePicture_DOM = document.querySelector('.profile-picture');
const text_DOMs = document.querySelectorAll('.text');

function forEachContents(callback) {
    for (let i = 0; i < text_DOMs.length; i++) {
        let contentsLength = text_DOMs[i].querySelectorAll('.content').length;

        for (let j = 0; j < contentsLength; j++) {
            const dom = text_DOMs[i].querySelector(`.content-${j}`);
            callback(dom, i, j);
        }
    }
}

/**
 *  0 -- up to -> window width - profile picture width
 *  (this affected by 'scrollYPercentage')
 */
let scrollY_proPicWd = 0;

function get_text_1_width() {
    return (window.innerWidth - scrollY_proPicWd - profilePicture_DOM.clientWidth) + 'px';
}

// initialization of 'text-1' width
const init_text_1_width_intervalId = setInterval(() => {

    if (profilePicture_DOM && profilePicture_DOM.clientWidth) {

        // init the fist text ('text_DOMs[1]') contents opacities
        forEachContents((dom, i, j) => {
            if (i === 1) {
                if (j === 0) {
                    dom.style.opacity = '1';
                }
                else dom.style.opacity = '0';
            }
        });

        // keep 'text_DOMs[1]' width follow the rest of available space
        text_DOMs[1].style.width = get_text_1_width();

        // stop interval
        clearInterval(init_text_1_width_intervalId);
    }
}, 0);

// changeable
let isLandscape;

function updateOrientation() {
    isLandscape = window.innerWidth / window.innerHeight >= 1
    ? true : false;
}

updateOrientation();

// fix text container size when screen size changed
window.addEventListener('resize', () => {
    text_DOMs[1].style.width = get_text_1_width();
    updateOrientation();
});

// content displayed flags
const contentDisplayedFlags = [];

forEachContents((dom, i, j) => {
    if (!contentDisplayedFlags[i]) {
        contentDisplayedFlags.push([]);
    }
    
    if (!contentDisplayedFlags[i][j]) {
        contentDisplayedFlags[i].push(false);
    }
});

/** EVENTS */

// only returns stringified positive number
function getFragmentInterval({
    scrollRate,
    fragment,
    fragment_prev,
    maxValue,
    index,
    isDecreaseToEvenNumber
}) {
    if (fragment <= 0) return '0';

    let fragmentedInterval = (
        (scrollRate - fragment_prev)
        * 100 / (fragment * 100 * 2)
    );

    if (fragmentedInterval < 0) return '0';

    // even
    if (isLandscape &&
        ((isDecreaseToEvenNumber && index % 2 === 0) ||
        (!isDecreaseToEvenNumber && index % 2 !== 0))
    ) {
        fragmentedInterval = maxValue - fragmentedInterval;
    }

    return `${fragmentedInterval}`;
}

window.addEventListener('scroll', () => {

    /** SCROLL Y */

    const maxScrollY = document.body.scrollHeight - window.innerHeight,
          scrollYPercentage = window.scrollY / maxScrollY;

    /**
     * Referring to 'scrollYPercentage'.
     * Create the 0.8 as minimum and 0.9 as maximum (the rate speeding up).
     */
    let middleScrollYPercentage;

    if (scrollYPercentage < 0.8) {
        middleScrollYPercentage = 0;
    }
    else if (scrollYPercentage >= 0.8 && scrollYPercentage < 0.9) {
        middleScrollYPercentage = (scrollYPercentage - 0.8) * 10;
    }
    else middleScrollYPercentage = 1;

    /** BACKGROUND */

    let fragmentIntervalArgs = {
        scrollRate: scrollYPercentage,
        maxValue: 0.5,
        isDecreaseToEvenNumber: true
    };

    if (window.scrollY < maxScrollY * 0.85) {
        headerBackground_DOM.style.visibility = 'visible';
        footerBackground_DOM.style.visibility = 'hidden';

        fragmentIntervalArgs.fragment = 0.85;
        fragmentIntervalArgs.fragment_prev = 0;
        fragmentIntervalArgs.index = 0;

        headerBackground_DOM.style.opacity = getFragmentInterval(fragmentIntervalArgs);
    }
    else {
        headerBackground_DOM.style.visibility = 'hidden';
        footerBackground_DOM.style.visibility = 'visible';

        fragmentIntervalArgs.fragment = 0.15;
        fragmentIntervalArgs.fragment_prev = 0.85;
        fragmentIntervalArgs.index = 1;

        footerBackground_DOM.style.opacity = getFragmentInterval(fragmentIntervalArgs);
    }

    /** TEXT */

    const textFragments = [0.2, 0.8];

    scrollY_proPicWd = (
        middleScrollYPercentage *
        (window.innerWidth - profilePicture_DOM.clientWidth)
    );

    text_DOMs[0].style.width = scrollY_proPicWd + 'px';
    text_DOMs[1].style.width = get_text_1_width();

    fragmentIntervalArgs.maxValue = 1;

    for (let i = 0; i < text_DOMs.length; i++) {
        let contentsLength = text_DOMs[i].querySelectorAll('.content').length;

        for (let j = 0; j < contentsLength; j++) {
            const dom = text_DOMs[i].querySelector(`.content-${j}`);

            dom.style.transform = (
                isLandscape && i === 1 ?
                `scale(${1 - middleScrollYPercentage})`:
                `scale(${middleScrollYPercentage})`
            );

            // joint change
            if (text_DOMs[i].clientWidth >= 300) {

                fragmentIntervalArgs.fragment = (1 / contentsLength) * textFragments[i];
                fragmentIntervalArgs.fragment_prev = (j / contentsLength) * textFragments[i];
                fragmentIntervalArgs.index = j;

                const opacity = getFragmentInterval(fragmentIntervalArgs);
                console.log(opacity);

                // if (contentDisplayedFlags[i][j]) {
                //     if (opacity > 0) {
                //         dom.style.opacity = 0;
                //     }
                // }
                // else {
                //     contentDisplayedFlags[i][j] = true;
                //     dom.style.opacity = opacity;
                // }
            }
            // joint change
            else if (text_DOMs[i].clientWidth <= 200) {
                dom.style.opacity = 0;
            }
            // individual change
            else dom.style.opacity = (
                isLandscape && i === 1 ?
                (1 - middleScrollYPercentage) / 2 :
                middleScrollYPercentage / 2
            );
        }

        if (i === 1) {
            console.log('----------------------');
        }
    }
});

