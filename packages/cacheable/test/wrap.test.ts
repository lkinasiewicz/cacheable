/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	describe, it, expect,
} from 'vitest';
import {Cacheable, CacheableMemory} from '../src/index.js';
import {
	wrap, createWrapKey, wrapSync, type WrapOptions, type WrapSyncOptions,
} from '../src/wrap.js';
import {sleep} from './sleep.js';

describe('wrap function', () => {
	it('should cache asynchronous function results', async () => {
		const asyncFunction = async (a: number, b: number) => a + b;
		const cache = new Cacheable();

		const options: WrapOptions = {
			keyPrefix: 'cacheKey',
			cache,
		};

		// Wrap the async function
		const wrapped = wrap(asyncFunction, options);

		// Call the wrapped function
		const result = await wrapped(1, 2);

		// Expectations
		expect(result).toBe(3);
		const cacheKey = createWrapKey(asyncFunction, [1, 2], options.keyPrefix);
		const cacheResult = await cache.get(cacheKey);
		expect(cacheResult).toBe(3);
	});

	it('should return cached async value with hash', async () => {
		// Mock cache and async function
		const asyncFunction = async (value: number) => Math.random() * value;
		const cache = new Cacheable();

		const options: WrapOptions = {
			cache,
		};

		// Wrap the async function
		const wrapped = wrap(asyncFunction, options);

		// Call the wrapped function
		const result = await wrapped(12);
		const result2 = await wrapped(12);
		// Expectations
		expect(result).toBe(result2);
	});

	it('should cache synchronous function results', () => {
		// Mock cache and sync function
		const syncFunction = (value: number) => Math.random() * value;
		const cache = new CacheableMemory();
		const options: WrapSyncOptions = {
			cache,
		};

		// Wrap the sync function
		const wrapped = wrapSync(syncFunction, options);

		// Call the wrapped function
		const result = wrapped(1, 2);
		const result2 = wrapped(1, 2);

		// Expectations
		expect(result).toBe(result2);
		const cacheKey = createWrapKey(syncFunction, [1, 2], options.keyPrefix);
		const cacheResult = cache.get(cacheKey);
		expect(cacheResult).toBe(result);
	});

	it('should cache synchronous function results with hash', () => {
		// Mock cache and sync function
		const syncFunction = (value: number) => Math.random() * value;
		const cache = new CacheableMemory();
		const options: WrapSyncOptions = {
			keyPrefix: 'testPrefix',
			cache,
		};

		// Wrap the sync function
		const wrapped = wrapSync(syncFunction, options);

		// Call the wrapped function
		const result = wrapped(1, 2);
		const result2 = wrapped(1, 2);

		// Expectations
		expect(result).toBe(result2);
	});

	it('should cache synchronous function results with key and ttl', async () => {
		// Mock cache and sync function
		const syncFunction = (value: number) => Math.random() * value;
		const cache = new CacheableMemory();
		const options: WrapSyncOptions = {
			cache,
			ttl: 10,
			keyPrefix: 'cacheKey',
		};

		// Wrap the sync function
		const wrapped = wrapSync(syncFunction, options);

		// Call the wrapped function
		const result = wrapped(1, 2);
		const result2 = wrapped(1, 2);

		// Expectations
		expect(result).toBe(result2);
		await sleep(30);
		const cacheKey = createWrapKey(syncFunction, [1, 2], options.keyPrefix);
		const cacheResult = cache.get(cacheKey);
		expect(cacheResult).toBe(undefined);
	});

	it('should cache synchronous function results with complex args', async () => {
		// Mock cache and sync function
		const syncFunction = (value: number, person: {first: string; last: string; meta: any}) => Math.random() * value;
		const cache = new CacheableMemory();
		const options: WrapSyncOptions = {
			keyPrefix: 'cacheKey',
			cache,
		};

		// Wrap the sync function
		const wrapped = wrapSync(syncFunction, options);

		// Call the wrapped function
		const result = wrapped(1, {first: 'John', last: 'Doe', meta: {age: 30}});
		const result2 = wrapped(1, {first: 'John', last: 'Doe', meta: {age: 30}});

		// Expectations
		expect(result).toBe(result2);
	});

	it('should cache synchronous function results with complex args and shorthand ttl', async () => {
		// Mock cache and sync function
		const syncFunction = (value: number, person: {first: string; last: string; meta: any}) => Math.random() * value;
		const cache = new CacheableMemory();
		const options: WrapSyncOptions = {
			cache,
			ttl: '1s',
			keyPrefix: 'cacheKey',
		};

		// Wrap the sync function
		const wrapped = wrapSync(syncFunction, options);

		// Call the wrapped function
		const result = wrapped(1, {first: 'John', last: 'Doe', meta: {age: 30}});
		const result2 = wrapped(1, {first: 'John', last: 'Doe', meta: {age: 30}});

		// Expectations
		expect(result).toBe(result2);
		await sleep(1500);
		const cacheKey = createWrapKey(wrapSync, [1, {first: 'John', last: 'Doe', meta: {age: 30}}], options.keyPrefix);
		const cacheResult = cache.get(cacheKey);
		expect(cacheResult).toBe(undefined);
	});
});
