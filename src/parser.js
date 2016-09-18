import * as R from 'ramda';
import * as Either from './either';
import { id } from './utils';

//
// type Parser a
// Parser that returns value of type a as a result
//

const Parser = function(f) {
    if (this === undefined || this.constructor !== Parser)
        return new Parser(f);

    this.run = f;
};

Parser.prototype.constructor = Parser;


//
// type ParseState
// keeps parsing state
//

const ParseState = function(input, pos = 0, binds = {}) {
    if (this === undefined || this.constructor !== ParseState)
        return new ParseState(input, pos, binds);

    this.input = input;
    this.pos = pos;
    this.binds = binds;
};

ParseState.prototype.constructor = ParseState;
ParseState.copy = st => ParseState(
    st.input,
    st.pos,
    R.clone(st.binds)
);


//
// type ParseResult Either a b ParseState
// contains the result of parser application and new state
//

const ParseResult = function(result, newState) {
    return {
        res: result,
        st: newState
    };
};


// runWithState :: Parser a -> ParseState -> ParseState
// runs parser with provided state
const runWithState = R.curry((parser, state) => parser.run(state));


// run :: Parser a -> b -> a
// runs parser upon input
export const run = R.curry((parser, input) => {
    const ret = runWithState(parser, ParseState(input));
    return ret.res;
});


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


// gather :: Parser a -> ({k: v} -> b) -> b
export const gather = R.curry((bindParser, transform) => Parser(state => {
    const ret = runWithState(bindParser, state);
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


// char :: Char -> Parser Char
// parses one char
export const char = ch => Parser(state => {
    const first = R.head(state.input);
    const rest = R.tail(state.input);
    if (first === ch)
        return ParseResult(
            Either.Right(ch),
            ParseState(
                rest,
                state.pos + 1,
                state.binds)
        );

    return ParseResult(
        Either.Left('expected char `' + ch + '`, instead got ' + first),
        ParseState.copy(state)
    );
});


// anyChar :: Parser Char
// parses any char
export const anyChar = Parser(state => {
    const first = R.head(state.input);
    const rest = R.tail(state.input);
    if (first !== '')
        return ParseResult(
            Either.Right(first),
            ParseState(
                rest,
                state.pos + 1,
                state.binds)
        );

    return ParseResult(
        Either.Left('expected any char'),
        ParseState.copy(state)
    );
});


// anyOf :: String -> Parser Char
// parses any of char in provided string
export const anyOf = chars => Parser(state => {
    const first = R.head(state.input);

    if (first !== '' && chars.includes(first))
        return ParseResult(
            Either.Right(first),
            ParseState(
                R.tail(state.input),
                R.inc(state.pos),
                state.binds)
        );

    return ParseResult(
        Either.Left('expected any of `' + chars + '`, got ' + first),
        ParseState.copy(state));
});


// noneOf :: String -> Parser Char
// parses char that is not among provided
export const noneOf = chars => Parser(state => {
    const ret = runWithState(anyOf(chars), state);
    const first = R.head(ret.st.input);
    return Either.either(
        () => ParseResult(
            Either.Right(first),
            ParseState(
                R.tail(ret.st.input),
                R.inc(ret.st.pos),
                R.clone(ret.st.binds))
        ),
        () => ParseResult(
            Either.Left(R.concat('expected none of `' + chars + '`, got `',
                                 Either.either(id, id, ret.res)) + '`'),
            ParseState.copy(state)
        ),
        ret.res);
});


// _digit :: Parser Char
// parses digit and return it
const _digit = anyOf('0123456789');


// digit :: Parser Int
// parses digit
export const digit = Parser(state => {
    const ret = runWithState(_digit, state);

    return Either.either(
        () => ret,
        res => ParseResult(
            Either.Right(Number(res)),
            ParseState.copy(ret.st)
        ),
        ret.res
    );
});


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


// string :: String -> Parser String
// parses a string
export const string = match => Parser(state => {
    if (state.input.startsWith(match))
        return ParseResult(
            Either.Right(match),
            ParseState(
                R.drop(match.length, state.input),
                state.pos + match.length,
                R.clone(state.binds))
        );

    return ParseResult(
        Either.Left("expected `" + match + "` at position " + state.pos),
        ParseState.copy(state)
    );
});
