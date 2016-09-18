import * as R from 'ramda';
import { Parser, ParseResult, ParseState, runWithState } from './parser-internals';
import * as Either from './either';
import { id } from './utils';

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
                state.binds));

    return ParseResult(
        Either.Left('expected any char'),
        ParseState.copy(state));
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
                R.clone(state.binds)));

    return ParseResult(
        Either.Left("expected `" + match + "` at position " + state.pos),
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
            ParseState.copy(ret.st)
        ),
        ret.res
    );
});


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
                state.binds));

    return ParseResult(
        Either.Left('expected char `' + ch + '`, instead got ' + first),
        ParseState.copy(state));
});


// letter :: Parser Char
// parses a letter
export const letter = Parser(state => {
    const first = R.head(state.input);
    const rest = R.tail(state.input);
    if (first.match(/[A-z]/)) {
        return ParseResult(
            Either.Right(first),
            ParseState(
                rest,
                state.pos + 1,
                state.binds));
    }

    return ParseResult(
        Either.Left('expected letter, instead got ' + first),
        ParseState.copy(state));
});
