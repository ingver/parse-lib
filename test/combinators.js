import { describe, it } from 'mocha';
import { assert } from 'chai';
import { extract } from '../src/either';
import P from '../src/parsers';


describe('Parser combinators', () => {
    describe('#many', () => {
        it('should return parser for zero or more applications', () => {
            const input = '123';
            const manyDigits = P.many(P.digit);
            const result = extract(P.run(manyDigits, input));
            const none = extract(P.run(manyDigits, ''));

            assert.deepEqual(result, [1, 2, 3]);
            assert.deepEqual(none, []);
        });
    });

    describe('#manyOne', () => {
        it('should return parser for one or more applications', () => {
            const parser = P.manyOne(P.digit);
            const parse = (input) => extract(P.run(parser, input));
            const input1 = '',
                  input2 = '0',
                  input3 = '123';

            assert.ok(P.run(parser, input1).isLeft());
            assert.deepEqual(parse(input2), [0]);
            assert.deepEqual(parse(input3), [1, 2, 3]);
        });
    });

    describe('#or', () => {
        it('should alter parsers', () => {
            const parser = P.or(P.digit, P.letter, P.char('!'));

            assert.equal(extract(P.run(parser, '1')), 1);
            assert.equal(extract(P.run(parser, 'a')), 'a');
            assert.equal(extract(P.run(parser, '!')), '!');
        });
    });
});
