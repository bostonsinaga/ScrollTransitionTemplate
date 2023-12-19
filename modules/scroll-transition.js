import MiniTools from "./mini-tools.js";

/**
 * Consumed by 'ScrollTransition' class.
 */
class Division {
    /**
     * @param {number} globalFragment - scroll y fragment (range: 0 < value <= 1)
     * @param {number[]} localFragments - fragments within the specified 'globalFragment'
     * @param {number} startFragment - scroll percentage, when the transition effect starts
     * @param {number} maxValue - range: 0 < value <= 1
     * @param {number[]} styleFlags - the flags defined at this class bottom
     * @param {number[]} domsInterval - 2 index of doms as loop counter limit (include, exclude)
     * @param {boolean[]} fadeInOut - 'true' is in, 'false' is out (front and back)
     */
    constructor(
        globalFragment = 1,
        localFragments = [1],
        startFragment = 0,
        maxValue = 1,
        styleFlags = [],
        domsInterval = [0, 0],
        fadeInOut = [false, false]
    ) {
        globalFragment = MiniTools.keepInside100Percent(globalFragment);
        startFragment = MiniTools.keepInside100Percent(startFragment);
        maxValue = MiniTools.keepInside100Percent(maxValue);
        domsInterval = MiniTools.keepNumberOfArrayMember(domsInterval, 2);
        fadeInOut = MiniTools.keepNumberOfArrayMember(fadeInOut, 2, [false, false], 'boolean');

        this.globalFragment = globalFragment;
        this.localFragments = localFragments;
        this.startFragment = startFragment;
        this.maxValue = maxValue;
        this.styleFlags = styleFlags;
        this.domsInterval = domsInterval;
        this.fadeInOut = fadeInOut;
        this.isDivision = true;
    }

    //_____________|
    // STYLE FLAGS |
    //_____________|

    static get WIDTH()     { return 0; }
    static get HEIGHT()    { return 1; }
    static get SCALE()     { return 2; }
    static get OPACITY()   { return 3; }
    static get FONT_SIZE() { return 4; }
};

/** The Main Class */
class ScrollTransition {
    /**
     * This goes along with vertical scroll of the window.
     * You may need to initialize elements style in main script.
     * But this follows the 'fadeInOut' value of the 'add' method.
     * For example, if the front is 'true' you need to set the first relative
     * element's style to minimum (using sine function) and vice versa.
     * 
     * Don't design the input 'doms' in HTML and CSS.
     * The effect may not work as expected.
     * 
     * Note:
     * Recommended to add more doms and their
     * configuration with 'add' method.
     * It's better to leave this by default.
     * 
     * @param {object[]} doms 
     * @param {Division[]} divisions 
     * @param {boolean} isLandscape 
     */
    constructor(
        doms = [],
        divisions = [],
        isLandscape = true
    ) {
        this.doms = doms;
        this.divisions = divisions;
        this.isLandscape = isLandscape;
    };

    /**
     * Add multiple DOMs whose styles will be changed at vertical scroll event.
     * Use this separately on groups with similar style changes.
     * 
     * @param {object} param 
     * @param {object[]} param.doms - html elements
     * @param {number} param.globalFragment - scroll y fragment (range: 0 < value <= 1)
     * @param {number[]} param.localFragments - fragments within the specified 'globalFragment'
     * @param {number} param.startFragment - scroll percentage, when the transition effect starts
     * @param {number} param.maxValue - range: 0 < value <= 1
     * @param {number[]} param.stylesToChange - can be multiple styles at once (use 'Division STYLE FLAGS')
     * @param {boolean[]} param.fadeInOut - 'true' is in, 'false' is out (front and back)
     * @returns {Division} - keep this to able to reduce 'this.doms' (use this as 'drop' parameter)
     */
    add(param) {
        const isParamUndefined = (val_in) => {
            if (typeof val_in === 'number' && (val_in < 0 || val_in >= 0)) {
                return true;
            }
            return val_in ? true : false;
        }

        /** Default Values */

        if (!isParamUndefined(param.doms))
            param.doms = [];

        if (!isParamUndefined(param.globalFragment))
            param.globalFragment = 1;

        if (!isParamUndefined(param.localFragments))
            param.localFragments = [1];

        if (!isParamUndefined(param.startFragment))
            param.startFragment = 0;

        if (!isParamUndefined(param.maxValue))
            param.maxValue = 1;

        if (!isParamUndefined(param.stylesToChange))
            param.stylesToChange = [];

        if (!isParamUndefined(param.fadeInOut))
            param.fadeInOut = [false, false];

        // 'param.doms' must an array
        if ((Array.isArray(param.doms) &&
            param.doms.length === 0) ||
            !Array.isArray(param.doms)
        ) {
            return;
        }

        const newDivision = new Division(
            param.globalFragment,
            param.localFragments,
            param.startFragment,
            param.maxValue,
            param.stylesToChange,
            [this.doms.length, this.doms.length + param.doms.length],
            param.fadeInOut
        );

        this.divisions.push(newDivision);
        this.doms = this.doms.concat(param.doms);
        return newDivision;
    }

    /**
     * Drop multiple 'doms' from 'this.doms'.
     * This following the 'division.domsInterval'.
     * The given 'division' removed as well from 'this.divisions'.
     * 
     * @param {Division} division 
     */
    drop(division) {
        if (division.isDivision) {

            // reduce doms
            this.doms = this.doms.slice(0, division.domsInterval[0]).concat(
                this.doms.slice(division.domsInterval[1] + 1)
            );

            // reduce divisions
            for (let i = 0; i < this.divisions.length; i++) {
                if (this.divisions[i] === division) {

                    this.divisions[i] = this.divisions[i].slice(0, i).concat(
                        this.divisions[i].slice(i + 1)
                    );

                    return;
                }
            }
        }
    }

    //________|
    // EVENTS |
    //________|

    // the 'doms' must already added before call this function
    startEvent() {
        this.updateOrientation();
        window.addEventListener('resize', this.updateOrientation);

        const peakValleyParam = {};

        const getValueUnit = (val_in) => {
            let unit = '';

            if (typeof val_in === 'string') {
                for (let i = val_in.length - 1; i >= 0; i--) {
                    if (MiniTools.isLetter(val_in[i])) {
                        unit += val_in[i];
                    }
                    else return unit.toLowerCase();
                }
                return unit.toLowerCase();
            }
            return '';
        }

        const changePixelStyle = (dom, styleKey, cssPropertyName) => {
            if (!cssPropertyName) cssPropertyName = styleKey;

            const styleValue = window.getComputedStyle(dom).getPropertyValue(cssPropertyName);
            
            dom.style[styleKey] = (
                this.getPeakValley(peakValleyParam)
                * MiniTools.filterNumberFromString(styleValue)
            ).toString() + getValueUnit(styleValue);
        };

        const changePercentageStyle = (dom, styleKey) => {
            dom.style[styleKey] = this.getPeakValley(peakValleyParam);
        };

        const getIndexInput = (firstIntervalValue, i) => {
            if (firstIntervalValue !== 0) {
                return i - firstIntervalValue;
            }
            return i;
        };

        // scroll y event
        window.addEventListener('scroll', () => {

            const maxScrollY = document.body.scrollHeight - window.innerHeight,
                  scrollYPercentage = window.scrollY / maxScrollY;

            peakValleyParam.scrollPercentage = scrollYPercentage;

            for (const div of this.divisions) {
                peakValleyParam.division = div;

                for (let i = div.domsInterval[0]; i < div.domsInterval[1]; i++) {
                    peakValleyParam.index = getIndexInput(div.domsInterval[0], i);

                    for (const styFg of div.styleFlags) {
                        switch (styFg) {
                            case Division.WIDTH: {
                                changePixelStyle(this.doms[i], 'width');
                            break}
                            case Division.HEIGHT: {
                                changePixelStyle(this.doms[i], 'height');
                            break}
                            case Division.SCALE: {
                                changePercentageStyle(this.doms[i], 'scale');
                            break}
                            case Division.OPACITY: {
                                changePercentageStyle(this.doms[i], 'opacity');
                            break}
                            case Division.FONT_SIZE: {
                                changePixelStyle(this.doms[i], 'fontSize', 'font-size');
                            break}
                            default: {}
                        }
                    }
                }
            }
        });
    }

    // call this in window resize event
    updateOrientation() {
        this.isLandscape = window.innerWidth / window.innerHeight >= 1 ? true : false;
    }

    /**
     * Using Trigonometry
     * 
     * @param {object} param 
     * @param {number} param.scrollPercentage 
     * @param {Division} param.division 
     * @param {number} param.index 
     */
    getPeakValley(param) {

        const getScrollFragment = (i) =>
              param.division.localFragments[i] * param.division.globalFragment;

        const fragment = getScrollFragment(param.index);

        // scroll value (0 - 1) to radian (0 - PI)
        let scrollRadian = Math.PI * param.scrollPercentage;

        /**
         * ZERO OR POINTS
         * Test whether 'scrollRadian' computed in correct fragments sequence.
         * If not this will directly return zero.
         */

        const localFragmentsLength = param.division.localFragments.length;

        const getAccumulationFragmentsRadian = (maxIndex) => {
            let accuVal = 0;

            for (let i = 0; i < localFragmentsLength; i++) {
                if (i <= maxIndex) {
                    accuVal += getScrollFragment(i) * Math.PI;
                }
                else break;
            }

            return accuVal;
        };

        const isIndexNotZero = param.index > 0,
              startFragment = param.division.startFragment * Math.PI;

        let nextRadian = startFragment + getAccumulationFragmentsRadian(param.index),
            prevRadian = startFragment;

        if (isIndexNotZero) {
            prevRadian += getAccumulationFragmentsRadian(param.index - 1);
        }

        if (prevRadian <= 0.001) prevRadian = 0;

        if ((isIndexNotZero && scrollRadian <= prevRadian) ||
            (!isIndexNotZero && scrollRadian < prevRadian) ||
            (scrollRadian > nextRadian && nextRadian < Math.PI)
        ) {
            return 0;
        }

        /** PEAK AND VALLEY */

        let product = 0;

        if (isIndexNotZero) scrollRadian -= prevRadian;
        else scrollRadian -= startFragment;

        /**
         * 'fr_dupli' < 1 = the wave length decrease
         * 'fr_dupli' > 1 = the wave length increase
         */
        const getTrigonInput = (fr_dupli) => scrollRadian / (fragment * fr_dupli);

        const getSinVal = (fr_dupli) => Math.abs(Math.sin(
            getTrigonInput(fr_dupli)
        ) * param.division.maxValue);

        const getCosVal = (fr_dupli) => Math.abs(Math.cos(
            getTrigonInput(fr_dupli)
        ) * param.division.maxValue);

        // front
        if (param.index === 0) {
            if (param.division.fadeInOut[0]) {
                product = getSinVal(1);
            }
            else product = getCosVal(2);
        }
        // back
        else if (param.index === localFragmentsLength - 1) {
            if (param.division.fadeInOut[1]) {
                product = getSinVal(2);
            }
            else product = getSinVal(1);
        }
        // between
        else product = getSinVal(1);

        return product;
    }
};

export {Division, ScrollTransition};

