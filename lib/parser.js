import { splitEvery, objWithProps } from './utils';

// returns tokenizer function
export const makeTokenizer = (delims = [], exclude = []) => {
    const exclObj = objWithProps(exclude);
    const tokenizer = (str) => {

        const split = delims.reduce((arr, del) => {
            return splitEvery(arr, del);
        }, [str]);
        return split.filter((el) => el !== '' && !(el in exclObj));
    };

    return tokenizer;
};
