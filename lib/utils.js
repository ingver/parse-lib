const isArr = Array.isArray;

// constructs object with properties of arr elements
export const objWithProps = (arr) => {
    const obj = {};
    if (!isArr(arr))
        return obj;

    arr.forEach((el) => obj[el] = true);
    return obj;
};

// flattens two-level deep Array
export const flattenArr = (arr) => {
    if (!isArr(arr))
        return [];

    return arr.reduce((acc, el) => {
        if (isArr(el))
            return acc.concat(el);
        else {
            acc.push(el);
            return acc;
        }
    }, []);
};

// flattens any-level deep Array
export const flattenDeepArr = (arr) => {
    if (!isArr(arr))
        return [];

    return arr.reduce((acc, el) => {
        if (Array.isArray(el))
            acc.concat(flattenDeepArr(el));
        else
            acc.push(el);
        return acc;
    }, []);
};

// insert delim between arr elements
export const combWith = (arr, delim) => {
    const [first, ...rest] = arr;
    return rest.reduce((acc, el) => {
        acc.push(delim);
        acc.push(el);
        return acc;
    }, [first]);
};

// splits string by delim but saves it in arr
export const splitSave = (str, delim) => {
    const split = combWith( str.split(delim), delim );
    return split;
};

// splits every element of arr by delim
export const splitEvery = (arr, delim) => {
    if (!isArr(arr) || typeof delim !== 'string')
        return [];
    const mapped = arr.map((el) => splitSave(el, delim));
    const flat = flattenArr(mapped);
    return flat;

    //return flattenArr( arr.map((el) => el.split(delim)) );
};
