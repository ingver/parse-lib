import { describe, it } from 'mocha';
import { assert } from 'chai';
import { id } from '../lib/utils';
import * as P from '../lib/parser';
import { either, Left } from '../lib/either';
import * as R from 'ramda';

describe('Testing parsers', () => {
    const extract = (e) => either(id, id, e);
    describe('common interface', () => {

        describe('#run', () => {
            it('should run a parser', () => {
                const str = 'foo';
                const parser = P.string(str);

                const result = extract(P.run(parser, str));
                assert.equal(result, str);
            });
        });

        describe('#chain', () => {
            it('should chain parsers', () => {
                const string = 'foobar';
                const parser = P.chain(
                    P.string('foo'),
                    P.string('bar')
                );
                const ret = extract(P.run(parser, string));

                assert.equal(ret, 'bar');
            });

            it('should chain multiple parsers', () => {
                const string = 'this is input!';
                const parser = P.chain(
                    P.string('this'),
                    P.string(' is '),
                    P.string('input!')
                );

                const ret = extract(P.run(parser, string));

                assert.equal(ret, 'input!');
            });
        });

        describe('#bind and #gather', () => {
            const pair = P.gather(
                P.chain(
                    P.bind('first', P.string('123')),
                    P.chain(
                        P.string(' '),
                        P.bind('second', P.string('456'))
                    )
                ),
                (data) => [Number(data.first), Number(data.second)]
            );

            const result = extract(P.run(pair, '123 456'));
            assert.deepEqual(result, [123, 456]);


            const triple = P.gather(
                P.chain(
                    P.bind('pair', pair),
                    P.chain(
                        P.string(' '),
                        P.bind('third', P.string('789'))
                    )
                ),
                (data) => {
                    const triple = R.clone(data.pair);
                    triple.push(Number(data.third));
                    return triple;
                }
            );

            const tr = extract(P.run(triple, '123 456 789'));
            assert.deepEqual(tr, [123, 456, 789]);
        });
    });

    describe('primitive parsers', () => {
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
                const input = 'abc@xyz';
                const result = extract(
                    P.run(P.chain(
                        P.string('abc'),
                        P.anyOf(chars),
                        P.string('xyz')),
                    input)
                );

                assert.equal(result, 'xyz');
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
    });
});
