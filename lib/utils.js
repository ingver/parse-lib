import * as R from 'ramda';

// a few aliases
export const isArr = R.is(Array);
export const isStr = R.is(String);
export const isObj = R.is(Object);

// constructs object with properties of arr elements
export const objWithProps = (arr) => {
    if (!isArr(arr) || arr.length === 0)
        return {};

    const pairs = R.map((item) => [item, true], arr);
    const obj = R.fromPairs(pairs);
    return obj;
};

// insert delim between arr elements
export const combWith = R.curry((delim, arr) => {
    const chained = R.chain((el) => [delim, el], R.tail(arr));
    return R.prepend(R.head(arr), chained);
});

// splits string by delim but saves it in arr
export const splitSave = R.curry((delim, str) => {
    return combWith( delim, R.split(delim, str) );
});

// splits every element of arr by delim
export const splitEvery = R.curry((delim, arr) => {
    if (!isArr(arr) || !isStr(delim))
        return [];
    
    return R.chain(splitSave(delim), arr);
});
