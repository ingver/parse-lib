import { describe, it } from 'mocha';
import { assert } from 'chai';
import * as P from '../lib/parser';
import { either } from '../lib/either';

describe('Testing parsers', () => {
    describe('common interface', () => {
        describe('#run', () => {
            it('should run a parser', () => {
                const str = 'foo';
                const parser = P.string(str);

                const result = either(
                    (err) => err,
                    (res) => res,
                    P.run(parser, str)
                );

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
                const ret = either(
                    (err) => err,
                    (res) => res,
                    P.run(parser, string)
                );

                assert.equal(ret, 'bar');
            });
        });
    });
});
