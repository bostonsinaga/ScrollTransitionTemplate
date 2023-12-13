//______|
// DOMs |
//______|

const headerBackground_DOM = document.querySelector('.header-background');
const footerBackground_DOM = document.querySelector('.footer-background');

//___________|
// FRAGMENTS |
//___________|

/**
 * Keep value between 0 or 1 (by default prevent from zero).
 * 
 * @param {number} value 
 * @param {boolean} preventZero 
 * @returns {number} 0 to 1
 */
function keepInside100Percent(value, preventZero = true) {

    if (value <= 0) {
        if (preventZero) value = 0.0001;
        else value = 0;
    }
    else if (value > 1) value = 1;

    return value;
}

class Division {
    /**
     * @param {number} globalFragment - scroll y fragment (range: 0 < value <= 1)
     * @param {number[]} localFragments - 'globalFragment' fragment (range: 0 < value <= 1)
     * @param {number} maxValue - range: 0 < value <= 1
     * @param {boolean} startFromPeak - start from maximum or minimum value
     */
    constructor(
        globalFragment = 1,
        localFragments = [1],
        maxValue = 1,
        startFromPeak = false
    ) {
        globalFragment = keepInside100Percent(globalFragment);
        maxValue = keepInside100Percent(maxValue);

        this.globalFragment = globalFragment;
        this.localFragments = localFragments;
        this.maxValue = maxValue;
        this.startFromPeak = startFromPeak;
    }
};

// ___________________|
// DOMs Configuration |
// ___________________|

/**
 * Note.
 * The CSS set all element inside 'CONTAINER' DOM
 * with 0 opacity. So the opacity of first order elements
 * need to initialized if 'division.startFromPeak' is true.
 */

const bg_division = new Division(1, [0.5, 0.5], 0.5, true);
headerBackground_DOM.style.opacity = 0.5;

//________|
// EVENTS |
//________|

// 'false' mean portrait
let isLandscape = true;

function updateOrientation() {
    isLandscape = window.innerWidth / window.innerHeight >= 1 ? true : false;
}

updateOrientation();
window.addEventListener('resize', updateOrientation);

/**
 * Using Trigonometry
 * 
 * @param {number} scrollPercentage 
 * @param {Division} division 
 * @param {number} index 
 */
function getPeakValley(
    scrollPercentage,
    division,
    index,
    returnAsString = true
) {
    const getScrollFragment = (i) =>
        division.localFragments[i] * division.globalFragment;

    const fragment = getScrollFragment(index);

    // scroll value (0 - 1) to radian (0 - PI)
    let scrollRadian = Math.PI * scrollPercentage;

    /**
     * ZERO OR POINTS
     * Test whether 'scrollRadian' computed in correct fragments sequence.
     * If not this will directly return zero.
     */

    const getAccumulationFragmentsRadian = (maxIndex) => {
        let accuVal = 0;

        for (let i = 0; i < division.localFragments.length; i++) {
            if (i <= maxIndex) {
                accuVal += getScrollFragment(i) * Math.PI;
            }
            else break;
        }

        return accuVal;
    };

    let nextRadian = getAccumulationFragmentsRadian(index),
        prevRadian = 0;

    if (index > 0) {
        prevRadian = getAccumulationFragmentsRadian(index - 1);
    }

    if ((index > 0 && scrollRadian <= prevRadian) ||
        scrollRadian > nextRadian
    ) {
        if (returnAsString) return '0';
        return 0;
    }

    /** PEAK AND VALLEY */

    let product = 0;

    if (index > 0) scrollRadian -= prevRadian;

    // the more 'fr_dupli', the more 

    /**
     * 'fr_dupli' < 1 = the wave length decrease
     * 'fr_dupli' > 1 = the wave length increase
     */
    const getTrigonInput = (fr_dupli) => scrollRadian / (fragment * fr_dupli);

    const getSinVal = (fr_dupli) => Math.abs(Math.sin(
        getTrigonInput(fr_dupli)
    ) * division.maxValue);

    const getCosVal = (fr_dupli) => Math.abs(Math.cos(
        getTrigonInput(fr_dupli)
    ) * division.maxValue);

    if (index === 0) {
        if (division.startFromPeak) {
            product = getCosVal(2);
        }
        else product = getSinVal(1);
    }
    else if (index === division.localFragments.length - 1) {
        if (division.startFromPeak) {
            product = getSinVal(2);
        }
        else product = getSinVal(1);
    }
    else product = getSinVal(1);

    if (returnAsString) return `${product}`;
    return product;
}

/** SCROLL EVENT */

window.addEventListener('scroll', () => {

    /** SCROLL Y */

    const maxScrollY = document.body.scrollHeight - window.innerHeight,
          scrollYPercentage = window.scrollY / maxScrollY;

    headerBackground_DOM.style.opacity = getPeakValley(scrollYPercentage, bg_division, 0);
    footerBackground_DOM.style.opacity = getPeakValley(scrollYPercentage, bg_division, 1);
});

