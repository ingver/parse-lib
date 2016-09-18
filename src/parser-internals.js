import { clone } from 'ramda';

//
// type Parser a
// Parser that returns value of type a as a result
//

export const Parser = function(f) {
    if (this === undefined || this.constructor !== Parser)
        return new Parser(f);

    this.run = f;
};

Parser.prototype.constructor = Parser;


//
// type ParseState
// keeps parsing state
//

export const ParseState = function(input, pos = 0, binds = {}) {
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
    clone(st.binds)
);


//
// type ParseResult Either a b ParseState
// contains the result of parser application and new state
//

export const ParseResult = function(result, newState) {
    return {
        res: result,
        st: newState
    };
};


// runWithState :: Parser a -> ParseState -> ParseState
// runs parser with provided state
export const runWithState = (parser, state) => parser.run(state);
