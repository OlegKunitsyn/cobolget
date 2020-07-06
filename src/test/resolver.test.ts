import { Resolver } from '../resolver';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
chai.should();

describe('Resolver tests', () => {
	it('1-level', () => {
		return new Resolver(
			{
				'test1': {
					'0.1.0': {},
					'0.1.1': {}
				},
				'test2': {
					'0.1.0': {},
					'0.1.1': {}
				}
			},
			{
				'test1': '^0.1.0',
				'test2': '0.1.0'
			}
		).resolve().should.eventually.eql({
			'test1': '0.1.1',
			'test2': '0.1.0'
		});
	});

	it('2-level', () => {
		return new Resolver(
			{
				'test1': {
					'0.1.0': {},
					'0.1.1': {}
				},
				'test2': {
					'0.1.0': {
						'test1': '^0.1.0'
					},
					'0.1.1': {
						'test1': '^0.1.1'
					}
				}
			},
			{
				'test2': '^0.1.0'
			},
		).resolve().should.eventually.eql({
			'test1': '0.1.1',
			'test2': '0.1.1'
		});
	});

	it('3-level', () => {
		return new Resolver(
			{
				'core-datetime': {
					'1.0.3': {
						'core': '*',
					},
					'1.0.2': {
						'core': '*',
					}
				},
				'core': {
					'3.0.3': {},
					'4.0.2': {}
				},
				'core-network': {
					'1.0.2': {
						'core-datetime': '*'
					},
					'1.0.1': {
						'core-datetime': '*'
					}
				}
			},
			{
				'core-network': '*'
			},
		).resolve().should.eventually.eql({
			'core': '4.0.2',
			'core-datetime': '1.0.3',
			'core-network': '1.0.2'
		});
	});
});
