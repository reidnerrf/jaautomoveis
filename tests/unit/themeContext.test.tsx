import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

const Consumer = () => {
	const { isDarkMode, toggleDarkMode } = useTheme();
	return (
		<div>
			<span data-testid="mode">{isDarkMode ? 'dark' : 'light'}</span>
			<button onClick={toggleDarkMode}>toggle</button>
		</div>
	);
};

describe('ThemeContext', () => {
	it('toggles dark mode', async () => {
		const user = userEvent.setup();
		render(
			<ThemeProvider>
				<Consumer />
			</ThemeProvider>
		);
		expect(screen.getByTestId('mode').textContent).toBe('light');
		await user.click(screen.getByText('toggle'));
		expect(screen.getByTestId('mode').textContent).toBe('dark');
	});
});
