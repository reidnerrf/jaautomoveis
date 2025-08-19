import '@testing-library/jest-dom';

// JSDOM lacks some APIs; provide minimal shims if needed
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

process.env.SKIP_DB = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
