import { describe, it } from 'mocha';
import { assert } from 'chai';
import { makeTokenizer } from '../lib/tokens';

describe('Testing parser', () => {
    describe('#makeTokenizer', () => {
        it('should return tokenizer', () => {
            const delims = ['.', ',', '!', '?'],
                  tokenize = makeTokenizer(delims),
                  tokens = tokenize("Hello, there! I'm Jack. And you?"),
                  expected = ["Hello", ",", " there", "!", " I'm Jack", ".", " And you", "?"];

            assert.deepEqual(tokens, expected);
        });

        it('should exclude tokens passed by second parameter', () => {
            const tokenize = makeTokenizer([' '], [' ']),
                  tokens = tokenize("1 2 3 4"),
                  expected = ['1', '2', '3', '4'];

            assert.deepEqual(tokens, expected);
        });

        it('should leave string if no delims passed', () => {
            const str = "abc",
                  tokenize = makeTokenizer(),
                  tokens = tokenize(str);

            assert.deepEqual(tokens, [str]);

            const tokenize2 = makeTokenizer([], [str]),
                  tokens2 = tokenize2(str);

            assert.deepEqual(tokens2, []);
        });
    });
});
