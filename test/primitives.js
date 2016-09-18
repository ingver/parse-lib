import { describe, it } from 'mocha';
import { assert } from 'chai';
import * as R from 'ramda';
import { extract } from '../src/either';
import P from '../src/parsers';


describe('Primitive parsers', () => {
    describe('#char', () => {
        it('should parse one character', () => {
            const ch = 'c';
            const p = P.char(ch);
            const result = extract(P.run(p, ch));

            assert.equal(result, ch);
        });
    });

    describe('#anyChar', () => {
        it('should parse any char', () => {
            const input = 'abc';
            const result = extract(P.run(P.anyChar, input));

            assert.equal(result, R.head(input));
        });
    });

    describe('#anyOf', () => {
        it('it should parse one of given chars', () => {
            const chars = '!@# ';
            const input = 'abc@';
            const parser = P.chain(P.string('abc'), P.anyOf(chars));
            const result = extract(P.run(parser, input));

            assert.equal(result, '@');
            assert.ok(P.run(parser, 'abc1').isLeft());
        });
    });

    describe('#noneOf', () => {
        it('it should parse char not among provided ones', () => {
            const exclude = '123';
            const input = 'xyz@';
            const parser = P.chain(P.string('xyz'), P.noneOf(exclude));
            const result = extract(P.run(parser, input));

            assert.equal(result, '@');
            assert.ok(P.run(parser, 'xyz3').isLeft());
        });
    });

    describe('#digit', () => {
        it('should parse digits', () => {
            const digits = '0123456789';
            R.forEach((digit) =>
                assert.equal(
                    extract(P.run(P.digit, digit)),
                    Number(digit)),
                digits
            );
        });
    });
});
