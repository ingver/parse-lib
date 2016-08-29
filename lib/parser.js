import { splitEvery, objWithProps, isArr } from './utils';
import * as R from 'ramda';

// returns tokenizer function
export const makeTokenizer = (delims = [], exclude = []) => {
    if (!isArr(delims) || !isArr(exclude))
        return [];
    const exclObj = objWithProps(exclude);

    const tokenizer = (str) => {
        // split string by every delimiter
        const allSplits = R.reduce(R.flip(splitEvery), [str], delims);
        const toExlude = R.has(R.__, exclObj);
        return R.reject(R.either( R.isEmpty, toExlude ), allSplits);
    };

    return tokenizer;
};


