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

const ParseState = function(input, pos = 0, bindings = {}) {
    if (this === undefined || this.constructor !== ParseState)
        return new ParseState(input, pos, bindings);

    this.__input = input;
    this.__position = pos;
    this.__bindings = bindings;
};

ParseState.prototype.constructor = ParseState;


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


// chain :: Parser a -> Parser b -> b
// returns a parser that applies p1 than p2 and returns a result of p2
export const chain = (p1, p2) => Parser((state) => {
    const ret = runWithState(p1, state);
    return Either.either(
        () => ret,
        () => runWithState(p2, ret.st()),
        ret.res()
    );
});


// string :: String -> Parser String
// parser a string
export const string = (match) => Parser((state) => {
    if (R.indexOf(match, state.__input) === state.__position) {
        return ParseResult(
            Either.Right(match),
            ParseState(state.__input, state.__position + match.length)
        );
    }
    
    const msg = "expected `" + match + "` at position " + state.__position;
    return ParseResult(
        Either.Left(msg),
        ParseState(state.__input, state.__position)
    );
});
