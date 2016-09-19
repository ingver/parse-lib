import * as R from 'ramda';
import * as Either from './either';
import { Parser, ParseResult, ParseState, runWithState } from './parser-internals';
import * as combs from './combinators';
import * as prims from './primitives';


// run :: Parser a -> b -> Either a
// runs parser upon input
const run = R.curry((parser, input) => {
    const ret = runWithState(parser, ParseState(input));
    return ret.res;
});


// gather :: Parser a -> ({k: v} -> b) -> b
const gather = R.curry((boundParser, transform) => Parser(state => {
    const ret = runWithState(boundParser, state);
    return Either.either(
        () => ret,
        () => ParseResult(
            Either.Right(transform(ret.st.binds)),
            ParseState(
                ret.st.input,
                ret.st.pos
            )
        ),
        ret.res
    );
}));


export default {
    run: run,
    gather: gather,
    chain: combs.chain,
    bind: combs.bind,
    many: combs.many,
    manyOne: combs.manyOne,
    or: combs.or,
    late: combs.late,
    opt: combs.opt,
    seq: combs.seq,

    anyOf: prims.anyOf,
    noneOf: prims.noneOf,
    anyChar: prims.anyChar,
    string: prims.string,
    char: prims.char,
    digit: prims.digit,
    letter: prims.letter
};
