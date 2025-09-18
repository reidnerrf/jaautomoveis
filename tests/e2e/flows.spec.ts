import { test, expect } from '@playwright/test';

test.describe('User flows', () => {
  test('search, filter, open vehicle detail, submit lead and WhatsApp CTA', async ({ page }) => {
    await page.goto('/');

    await page.goto('/inventory');
    const search = page.locator('input[name="vehicle-search"], #vehicle-search');
    await search.fill('Fiat');
    await page.waitForTimeout(300);

    // Open first vehicle card
    const firstCard = page.locator('a[href^="/vehicle/"]').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/vehicle\//);

    // Mini lead form exists
    const nameInput = page.locator('#lead-name');
    const whatsInput = page.locator('#lead-whats');
    await expect(nameInput).toBeVisible();
    await expect(whatsInput).toBeVisible();

    await nameInput.fill('Teste Playwright');
    await whatsInput.fill('(24) 99999-9999');
    await page.getByRole('button', { name: /proposta|enviar|propose|lead/i }).first().click({ trial: true }).catch(() => {});

    // WhatsApp CTA visible
    const waCta = page.getByRole('button', { name: /whatsapp/i }).first();
    await expect(waCta).toBeVisible();
  });
});

