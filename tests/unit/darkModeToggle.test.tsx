import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import DarkModeToggle from '../../components/DarkModeToggle';

test('DarkModeToggle toggles title attribute', async () => {
	const user = userEvent.setup();
	render(
		<ThemeProvider>
			<DarkModeToggle />
		</ThemeProvider>
	);
	const btn = screen.getByRole('button', { name: /alternar modo escuro/i });
	expect(btn).toHaveAttribute('title', 'Modo escuro');
	await user.click(btn);
	expect(btn).toHaveAttribute('title', 'Modo claro');
});
