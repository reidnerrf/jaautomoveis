import '@testing-library/jest-dom';

// Only define JSDOM shims when running in a browser-like environment
if (typeof window !== 'undefined' && typeof window.matchMedia === 'undefined') {
	Object.defineProperty(window, 'matchMedia', {
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}),
	});
}

process.env.SKIP_DB = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
