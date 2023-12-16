export default class MiniTools {
    /**
     * Keep an array to always has fixed count of members.
     * 
     * @param {*[]} arr - array to be replaced
     * @param {number} count - fixed count
     * @param {[]} defArr - default array
     * @param {string} type - data type
     * @returns {*[]} new kept array
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

    /**
     * Check if 'val_in' is a number.
     * The 'val_in' is generally a character.
     * 
     * @param {*} val_in 
     * @returns {boolean}
     */
    static isNumber(val_in) {
        val_in = parseInt(val_in);
        return typeof val_in === 'number' && (val_in < 0 || val_in >= 0);
    }

    /**
     * Get number that contained in a string.
     * Like unit value.
     * 
     * Note. The 'dot' character is considered as a decimal point.
     * 
     * @param {string} str_in 
     */
    static filterNumberFromString(str_in) {
        const numArr = [[], []];

        let retNum = 0,
            isWholeNumber = true,
            isDotPushed = false,
            wholeCount = 0,
            fractionCount = 0;

        for (const ch of str_in) {
            if (MiniTools.isNumber(ch)) {
                numArr[isDotPushed ? 1 : 0].push(parseInt(ch));
                if (isDotPushed) fractionCount++;
                else wholeCount++;
            }
            else if (!isDotPushed && ch === '.') {
                numArr[0].push(ch);
                isDotPushed = true;
            }
        }

        for (let i = 0; i < numArr.length; i++) {
            for (let j = 1; j <= numArr[i].length; j++) {

                if (numArr[i][j-1] === '.') {
                    isWholeNumber = false;
                    break;
                }

                if (isWholeNumber) {
                    retNum += numArr[i][j-1] * Math.pow(10, wholeCount - j);
                }
                else retNum += numArr[i][j-1] / Math.pow(10, j);
            }
        }
        
        return retNum;
    }
};

