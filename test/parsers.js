import { describe, it } from 'mocha';
import { assert } from 'chai';
import P from '../src/parsers';
import { extract } from '../src/either';
import * as R from 'ramda';


describe('Testing parsers', () => {
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
                P.string(' '),
                P.bind('second', P.string('456'))
            ),
            (data) => [Number(data.first), Number(data.second)]
        );

        const result = extract(P.run(pair, '123 456'));
        assert.deepEqual(result, [123, 456]);


        const triple = P.gather(
            P.chain(
                P.bind('pair', pair),
                P.string(' '),
                P.bind('third', P.string('789'))
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
