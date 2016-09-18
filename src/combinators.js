import * as R from 'ramda';
import * as Either from './either';
import { Parser, ParseResult, ParseState, runWithState } from './parser-internals';
import { id } from './utils';


// chainTwo :: Parser a -> Parser b -> Parser b
// returns parser that applies p1 than p2 and returns a result of p2
const chainTwo = R.curry((p1, p2) => Parser(state => {
    const ret = runWithState(p1, state);
    return Either.either(
        () => ret,
        () => runWithState(p2, ret.st),
        ret.res
    );
}));


// chain :: [Parser a] -> Parser a
// chains parsers into the new one, which returns result of the last parser
export const chain = (first, ...rest) => R.reduce(chainTwo, first, rest);


// bind :: String -> Parser a -> Parser a
// wrapper that saves result of parser in object with given prop
export const bind = R.curry((name, parser) => Parser(state => {
    const ret = runWithState(parser, state);
    return Either.either(
        () => ret,
        result => ParseResult(
            ret.res,
            ParseState(
                ret.st.input,
                ret.st.pos,
                R.assoc(name, result, ret.st.binds))),
        ret.res
    );
}));


// many :: Parser a -> Parser [a]
// returns parser, which can be applied zero or more times.
// the result of application is a list of parsed contents.
export const many = parser => Parser(state => {
    let results = Either.Right([]);
    let curState = state;

    while (true) {
        const ret = runWithState(parser, curState);
        curState = ret.st;

        if (ret.res.isLeft()) {
            return ParseResult(
                results,
                curState);
        }

        results = results.bind(R.append(Either.either(id, id, ret.res)));
    }
});


// manyOne :: Parser a -> Parser a
// returns parser, which can be applied one or more times
export const manyOne = parser => Parser(state => {
    const first = runWithState(parser, state);
    if (first.res.isLeft())
        return first;

    const rest = runWithState(many(parser), first.st);
    return ParseResult(
        rest.res.bind(R.prepend(Either.either(id, id, first.res))),
        rest.st
    );
});


// _or :: Parser a -> Parser b -> Parser (a|b)
// altering two parser
const _or = (p1, p2) => Parser(state => {
    const ret = runWithState(p1, state);
    return Either.either(
        () => runWithState(p2, ret.st),
        () => ret,
        ret.res
    );
});


// or :: [Parser a] -> Parser a
// altering multiple parsers
export const or = (first, ...rest) => R.reduce(_or, first, rest);
