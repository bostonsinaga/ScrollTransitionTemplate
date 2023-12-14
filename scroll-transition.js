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
        globalFragment = Division.keepInside100Percent(globalFragment);
        maxValue = Division.keepInside100Percent(maxValue);
        domsInterval = Division.keepNumberOfArrayMember(domsInterval, 2);

        this.globalFragment = globalFragment;
        this.localFragments = localFragments;
        this.maxValue = maxValue;
        this.styleFlags = styleFlags;
        this.domsInterval = domsInterval;
        this.startFromPeak = startFromPeak;
        this.isDivision = true;
    }

    /**
     * Keep an array to always has
     * 
     * 
     * @param {*} arr 
     * @param {*} count 
     * @param {*} defArr 
     * @param {*} type 
     * @returns 
     */
    static keepNumberOfArrayMember(
        arr,
        count,
        defArr = [0, 0],
        type = 'number'
    ) {
        if (count <= 0) return [];

        if (Array.isArray(arr)) {
            if (arr.length > count) {
                return arr.slice(0, count);
            }
            else if (arr.length < count) {
                for (let i = count - 1; i < count; i++) {
                    switch (type) {
                        case 'number': {
                            arr.push(0);
                        break}
                        case 'string': {
                            arr.push('');
                        break}
                        case 'boolean': {
                            arr.push(false);
                        break}
                        case 'object': {
                            arr.push(null);
                        break}
                        default: {
                            arr.push(undefined);
                        }
                    }
                }
            }
            else return arr;
        }
        
        return defArr;
    }

    /**
     * Keep value between 0 or 1 (by default prevent from zero).
     * 
     * @param {number} value 
     * @param {boolean} preventZero 
     * @returns {number} 0 to 1
     */
    static keepInside100Percent(value, preventZero = true) {
        
        if (value <= 0) {
            if (preventZero) value = 0.0001;
            else value = 0;
        }
        else if (value > 1) value = 1;
        return value;
    }

    //_____________|
    // STYLE FLAGS |
    //_____________|

    static get OPACITY() { return 0; }
    static get WIDTH()   { return 1; }
    static get HEIGHT()  { return 2; }
    static get SCALE()   { return 2; }
};

/**
 * The Main Class
 * This goes along with the vertical scroll of the window.
 */
class ScrollTransition {

    /**
     * Recommended to add more doms and their
     * configuration with 'add' method.
     * It's better to leave this by default.
     * 
     * @param {number[]} doms 
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
     * 
     * @param {object[]} doms - html elements
     * @param {number} globalFragment - range: 0 < value <= 1
     * @param {number[]} localFragments 
     * @param {number} maxValue 
     * @param {number[]} stylesToChange - can be multiple styles at once (use 'Division STYLE FLAGS')
     * @param {boolean} startFromPeak 
     * @returns {Division} - keep this to able to reduce 'this.doms' (use this as 'drop' parameter)
     */
    add(doms = [],
        globalFragment = 1,
        localFragments = [1],
        maxValue = 1,
        stylesToChange = [],
        startFromPeak = false
    ) {
        if (Array.isArray(doms) && doms.length === 0) {
            return;
        }

        const newDivision = new Division(
            globalFragment,
            localFragments,
            maxValue,
            stylesToChange,
            [this.doms.length, this.doms.length + doms.length],
            startFromPeak
        );

        this.divisions.push(newDivision);
        this.doms = this.doms.concat(doms);
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
        updateOrientation();
        window.addEventListener('resize', updateOrientation);

        // scroll y event
        window.addEventListener('scroll', () => {

            const maxScrollY = document.body.scrollHeight - window.innerHeight,
                  scrollYPercentage = window.scrollY / maxScrollY;

            const peakValleyParam = {
                scrollPercentage: scrollYPercentage,
                division: new Division(),
                index: 0,
                returnAsString: true
            };

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
                            case Division.OPACITY: {
                                this.doms[i].style.opacity = getPeakValley(peakValleyParam);
                            break}
                            case Division.WIDTH: {
                                this.doms[i].style.width = getPeakValley(peakValleyParam);
                            break}
                            case Division.HEIGHT: {
                                this.doms[i].style.height = getPeakValley(peakValleyParam);
                            break}
                            case Division.SCALE: {
                                this.doms[i].style.scale = getPeakValley(peakValleyParam);
                            break}
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
     * @param {boolean} param.returnAsString 
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

        const getAccumulationFragmentsRadian = (maxIndex) => {
            let accuVal = 0;

            for (let i = 0; i < param.division.localFragments.length; i++) {
                if (i <= maxIndex) {
                    accuVal += getScrollFragment(i) * Math.PI;
                }
                else break;
            }

            return accuVal;
        };

        let nextRadian = getAccumulationFragmentsRadian(param.index),
            prevRadian = 0;

        if (param.index > 0) {
            prevRadian = getAccumulationFragmentsRadian(param.index - 1);
        }

        if ((param.index > 0 && scrollRadian <= prevRadian) ||
            scrollRadian > nextRadian
        ) {
            if (param.returnAsString) return '0';
            return 0;
        }

        /** PEAK AND VALLEY */

        let product = 0;

        if (param.index > 0) scrollRadian -= prevRadian;

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
        else if (param.index === param.division.localFragments.length - 1) {
            if (param.division.startFromPeak) {
                product = getSinVal(2);
            }
            else product = getSinVal(1);
        }
        else product = getSinVal(1);

        if (param.returnAsString) return `${product}`;
        return product;
    }
};

