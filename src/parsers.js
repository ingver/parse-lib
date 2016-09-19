import * as R from 'ramda';
import * as Either from './either';
import { Parser, ParseResult, ParseState, runWithState } from './parser-internals';


// run :: Parser a -> b -> Either a
// runs parser upon input
export const run = R.curry((parser, input) => {
    const ret = runWithState(parser, ParseState(input));
    return ret.res;
});


// gather :: Parser a -> ({k: v} -> b) -> b
export const gather = R.curry((boundParser, transform) => Parser(state => {
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

export * from './combinators';
export * from './primitives';
