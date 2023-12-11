//______|
// DOMs |
//______|

const headerBackground_DOM = document.querySelector('.header-background');
const footerBackground_DOM = document.querySelector('.footer-background');
const profilePicture_DOM = document.querySelector('.profile-picture');
const text_DOMs = document.querySelectorAll('.text');

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
     * @param {*} globalFragment - scroll y fragment (range: 0 < value <= 1)
     * @param {*} peakValue - range: 0 < value <= 1
     * @param {*} trigonometryType - 'sin' or 'cos'
     */
    constructor(globalFragment = 1, peakValue = 1, trigonometryType = 'sin') {

        globalFragment = keepInside100Percent(globalFragment);
        peakValue = keepInside100Percent(peakValue);

        this.globalFragment = globalFragment;
        this.peakValue = peakValue;
        this.trigonometryType = trigonometryType;
    }
};

// ___________________|
// DOMs Configuration |
// ___________________|

const bg_localFragments = [0.25, 0.75];
const bg_division = new Division(1, 0.5, 'cos');

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
 * This using trigonometry.
 * 
 * @param {object} param 
 * @param {number} param.scrollPercentage 
 * @param {number} param.localFragments 
 * @param {number} param.index 
 * @param {Division} param.division 
 * @param {boolean} param.returnInString 
 * @returns {number} Range from 0 to 1
 */
function getPeakValley(param = {
    scrollPercentage: 0,
    localFragments: 1,
    index: 0,
    division: new Division(),
    returnInString: true
}) {
    param.localFragments[param.index] = keepInside100Percent(param.localFragments[param.index]);
    const fragment = param.localFragments[param.index] * param.division.globalFragment;

    if (!param.division || param.division.peakValue <= 0 || fragment === 0) {
        console.error("Input error. The 'getPeakValley' function contains a not expected 0 or null argument.");
        return 0;
    }

    // scroll value (0 - 1) to radian (0 - PI)
    const scrollRadian = Math.PI * param.scrollPercentage;

    // peak and valley count ('scrollRadian' = 0 is not count)
    let period = Math.floor(scrollRadian / (Math.PI * fragment));

    // decrease max period to prevent return 0 at maximum scroll
    if (period >= param.localFragments.length) {
        period--;
    }

    /**
     * Only provides values for the index corresponding to the period.
     * For example, 'bg_0' has 0 index so it has the value in period 0.
     */
    if (param.index !== period) {
        return 0;
    }

    // input in radian
    const trigonometryInput = scrollRadian / (fragment * 2);

    // return value
    let product;

    if (param.division.trigonometryType === 'sin') {
        product = Math.abs( Math.sin(trigonometryInput) * param.division.peakValue );
    }
    else if (param.division.trigonometryType === 'cos') {
        product = Math.abs( Math.cos(trigonometryInput) * param.division.peakValue );
    }

    if (param.returnInString) {
        return `${product}`;
    }

    return product;
}

window.addEventListener('scroll', () => {

    /** SCROLL Y */

    const maxScrollY = document.body.scrollHeight - window.innerHeight,
          scrollYPercentage = window.scrollY / maxScrollY;

    // object parameters initialization
    const peakValleyParam = {
        scrollPercentage: scrollYPercentage,
        localFragments: 1,
        index: 0,
        division: new Division(),
        returnInString: true
    };

    if (isLandscape) {
        /** BACKGROUNDS */
        
        peakValleyParam.localFragments = bg_localFragments;
        peakValleyParam.division = bg_division;

        peakValleyParam.index = 0;
        headerBackground_DOM.style.opacity = getPeakValley(peakValleyParam);

        peakValleyParam.index = 1;
        footerBackground_DOM.style.opacity = getPeakValley(peakValleyParam);
    }
});

