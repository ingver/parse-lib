import { describe, it } from 'mocha';
import { assert } from 'chai';
import * as P from '../lib/parser';
import { either } from '../lib/either';
import * as R from 'ramda';

describe('Testing parsers', () => {
    describe('common interface', () => {
        const id = x => x;

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
});
