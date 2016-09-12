import { describe, it } from 'mocha';
import { assert } from 'chai';
import { id } from '../lib/utils';
import * as P from '../lib/parser';
import { either } from '../lib/either';
import * as R from 'ramda';

describe('Testing parsers', () => {
    describe('common interface', () => {

        describe('#run', () => {
            it('should run a parser', () => {
                const str = 'foo';
                const parser = P.string(str);

                const result = either(id, id, P.run(parser, str));
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
                const ret = either(id, id, P.run(parser, string));

                assert.equal(ret, 'bar');
            });

            it('should chain multiple parsers', () => {
                const string = 'this is input!';
                const parser = P.chain(
                    P.string('this'),
                    P.string(' is '),
                    P.string('input!')
                );

                const ret = either(id, id, P.run(parser, string));

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

            const result = either(id, id, P.run(pair, '123 456'));
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

            const tr = either(id, id, P.run(triple, '123 456 789'));
            assert.deepEqual(tr, [123, 456, 789]);
        });
    });

    describe('primitive parsers', () => {
        describe('#char', () => {
            it('should parse one character', () => {
                const ch = 'c';
                const p = P.char(ch);
                const result = either(id, id, P.run(p, ch));

                assert.equal(result, ch);
            });
        });

        describe('#anyChar', () => {
            it('should parse any char', () => {
                const input = 'abc';
                const result = either(id, id, P.run(P.anyChar, input));

                assert.equal(result, R.head(input));
            });
        });

        describe('#anyOf', () => {
            it('it should parse one of given chars', () => {
                const chars = '!@# ';
                const input = 'abc@xyz';
                const result = either(id, id,
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
                        either(id, id, P.run(P.digit, digit)),
                        Number(digit)),
                    digits
                );
            });
        });
    });
});
