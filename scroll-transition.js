import MiniTools from "./mini-tools";

/**
 * Consumed by 'ScrollTransition' class.
 */
class Division {
    /**
     * @param {number} globalFragment - scroll y fragment (range: 0 < value <= 1)
     * @param {number[]} localFragments - 'globalFragment' fragment (range: 0 < value <= 1)
     * @param {number} maxValue - range: 0 < value <= 1
     * @param {number[]} styleFlags - the flags defined at this class bottom
     * @param {number[]} domsInterval - 2 index of doms as loop counter limit (include, exclude)
     * @param {boolean} startFromPeak - start from maximum or minimum value
     */
    constructor(
        globalFragment = 1,
        localFragments = [1],
        maxValue = 1,
        styleFlags = [],
        domsInterval = [0, 0],
        startFromPeak = false
    ) {
        globalFragment = MiniTools.keepInside100Percent(globalFragment);
        maxValue = MiniTools.keepInside100Percent(maxValue);
        domsInterval = MiniTools.keepNumberOfArrayMember(domsInterval, 2);

        this.globalFragment = globalFragment;
        this.localFragments = localFragments;
        this.maxValue = maxValue;
        this.styleFlags = styleFlags;
        this.domsInterval = domsInterval;
        this.startFromPeak = startFromPeak;
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
     * This goes along with the vertical scroll of the window.
     * You may need to initialize elements style in CSS.
     * But this follows the 'startFromPeak' value of the 'add' method.
     * For example, if it 'true' you need to set the first relative
     * element's style to maximum and vice versa.
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
     * @param {number} param.globalFragment - range: 0 < value <= 1
     * @param {number[]} param.localFragments 
     * @param {number} param.maxValue 
     * @param {number[]} param.stylesToChange - can be multiple styles at once (use 'Division STYLE FLAGS')
     * @param {boolean} param.startFromPeak 
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

        if (!isParamUndefined(param.maxValue))
            param.maxValue = 1;

        if (!isParamUndefined(param.stylesToChange))
            param.stylesToChange = [];

        if (!isParamUndefined(param.startFromPeak))
            param.startFromPeak = false;

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
            param.maxValue,
            param.stylesToChange,
            [this.doms.length, this.doms.length + param.doms.length],
            param.startFromPeak
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

        const changePixelStyle = (dom, styleKey) => {
            dom.style[styleKey] = (
                this.getPeakValley(peakValleyParam)
                * MiniTools.filterNumberFromString(dom.style[styleKey])
            ).toString() + 'px';
        };

        const changePercentageStyle = (dom, styleKey) => {
            dom.style[styleKey] = this.getPeakValley(peakValleyParam);
        };

        // scroll y event
        window.addEventListener('scroll', () => {

            const maxScrollY = document.body.scrollHeight - window.innerHeight,
                  scrollYPercentage = window.scrollY / maxScrollY;

            peakValleyParam.scrollPercentage = scrollYPercentage;

            const getIndexInput = (firstIntervalValue, i) => {
                if (firstIntervalValue !== 0) {
                    return i - firstIntervalValue + 1;
                }
                return i;
            };

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
                                changePixelStyle(this.doms[i], 'fontSize');
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
              isIndexTheLast = param.index === localFragmentsLength - 1;

        let nextRadian = getAccumulationFragmentsRadian(param.index),
            prevRadian = 0;

        if (isIndexNotZero) {
            prevRadian = getAccumulationFragmentsRadian(param.index - 1);
        }

        if ((isIndexNotZero && scrollRadian <= prevRadian) ||
            (!isIndexTheLast && scrollRadian > nextRadian)
        ) {
            return 0;
        }

        /** PEAK AND VALLEY */

        let product = 0;

        if (isIndexNotZero) scrollRadian -= prevRadian;

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

        if (param.index === 0) {
            if (param.division.startFromPeak) {
                product = getCosVal(2);
            }
            else product = getSinVal(1);
        }
        else if (isIndexTheLast) {
            if (param.division.startFromPeak) {
                product = getSinVal(2);
            }
            else product = getSinVal(1);
        }
        else product = getSinVal(1);

        return product;
    }
};

export {Division, ScrollTransition};

