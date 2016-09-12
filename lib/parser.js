import * as R from 'ramda';
import * as Either from './either';

//
// type Parser a
// Parser that returns value of type a as a result
//

const Parser = function(f) {
    if (this === undefined || this.constructor !== Parser)
        return new Parser(f);

    this.__run = f;
};

Parser.prototype.constructor = Parser;


//
// type ParseState
// keeps parsing state
//

const ParseState = function(input, pos = 0, binds = {}) {
    if (this === undefined || this.constructor !== ParseState)
        return new ParseState(input, pos, binds);

    this.__input = input;
    this.__pos = pos;
    this.__binds = binds;
};

ParseState.prototype.constructor = ParseState;
ParseState.copy = st => ParseState(
    st.__input,
    st.__pos,
    R.clone(st.__binds)
);


//
// type ParseResult Either a b ParseState
// contains the result of parser application and new state
//

const ParseResult = function(result, newState) {
    return {
        res: () => result,
        st: () => newState
    };
};


// runWithState :: Parser a -> ParseState -> ParseState
// runs parser with provided state
const runWithState = R.curry((parser, state) => parser.__run(state));


// run :: Parser a -> b -> a
// runs a parser upon input
export const run = R.curry((parser, input) => {
    const ret = runWithState(parser, ParseState(input));
    return ret.res();
});


// chainTwo :: Parser a -> Parser b -> Parser b
// returns a parser that applies p1 than p2 and returns a result of p2
const chainTwo = (p1, p2) => Parser(state => {
    const ret = runWithState(p1, state);
    return Either.either(
        () => ret,
        () => runWithState(p2, ret.st()),
        ret.res()
    );
});


// chain :: [Parser a] -> Parser a
// chains parsers into the new one, which returns result of the last parser
export const chain = (first, ...rest) => {
    return R.reduce(chainTwo, first, rest);
};


// bind :: String -> Parser a -> Parser a
// wrapper that saves result of parser in object with given prop
export const bind = (name, parser) => Parser(state => {
    const ret = runWithState(parser, state);
    return Either.either(
        () => ret,
        result => ParseResult(
            ret.res(),
            ParseState(
                ret.st().__input,
                ret.st().__pos,
                R.assoc(name, result, ret.st().__binds))),
        ret.res()
    );
});


// gather :: Parser a -> ({k: v} -> b) -> b
export const gather = (bindParser, transform) => Parser(state => {
    const ret = runWithState(bindParser, state);
    return Either.either(
        () => ret,
        () => ParseResult(
            Either.Right(transform(ret.st().__binds)),
            ParseState(
                ret.st().__input,
                ret.st().__pos
            )
        ),
        ret.res()
    );
});


// char :: Char -> Parser Char
// parses one char
export const char = ch => Parser(state => {
    const first = R.head(state.__input);
    const rest = R.tail(state.__input);
    if (first === ch)
        return ParseResult(
            Either.Right(ch),
            ParseState(
                rest,
                state.__pos + 1,
                state.__binds)
        );

    return ParseResult(
        Either.Left('expected char `' + ch + '`, instead got ' + first),
        ParseState.copy(state)
    );
});


// anyChar :: Parser Char
// parses any char
export const anyChar = Parser(state => {
    const first = R.head(state.__input);
    const rest = R.tail(state.__input);
    if (first !== '')
        return ParseResult(
            Either.Right(first),
            ParseState(
                rest,
                state.__pos + 1,
                state.__binds)
        );

    return ParseResult(
        Either.Left('expected any char'),
        ParseState.copy(state)
    );
});


// anyOf :: String -> Parser Char
// parser any of char in provided string
export const anyOf = chars => Parser(state => {
    const first = R.head(state.__input);

    if (chars.includes(first))
        return ParseResult(
            Either.Right(first),
            ParseState(
                R.tail(state.__input),
                R.inc(state.__pos),
                state.__binds)
        );

    return ParseResult(
        Either.Left('expected any of `' + chars + '`, got ' + first),
        ParseState.copy(state));
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
            ParseState.copy(ret.st())
        ),
        ret.res()
    );
});


// string :: String -> Parser String
// parses a string
export const string = match => Parser(state => {
    if (state.__input.startsWith(match))
        return ParseResult(
            Either.Right(match),
            ParseState(
                R.drop(match.length, state.__input),
                state.__pos + match.length,
                R.clone(state.__binds))
        );

    return ParseResult(
        Either.Left("expected `" + match + "` at position " + state.__pos),
        ParseState.copy(state)
    );
});
