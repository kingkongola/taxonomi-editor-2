import { test, expect } from '@playwright/test';

test.describe('Taxonomy Workstation E2E Flows', () => {

  test('Scenario 1: Navigation & Sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Taxonomy Workstation/);
    await expect(page.getByText('Lightning Fast')).toBeVisible();

    await page.getByRole('link', { name: 'Graph' }).click();
    await expect(page).toHaveURL(/\/graph/);

    await page.getByRole('link', { name: 'Data' }).click();
    await expect(page).toHaveURL(/\/data/);

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('Taxonomy Workstation')).toBeVisible();
  });

  test('Scenario 2: Search & Discovery (Command Palette)', async ({ page }) => {
    await page.goto('/');

    // 1. Open Command Palette
    await page.waitForTimeout(1000);
    try {
        await expect(page.getByPlaceholder('Type a command or search...')).toBeVisible({ timeout: 2000 });
    } catch (e) {
        await page.evaluate(() => {
             document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
        });
    }
    await expect(page.getByPlaceholder('Type a command or search...')).toBeVisible();

    // 2. Type query "Java"
    await page.getByPlaceholder('Type a command or search...').fill('Java');

    // 3. Wait for results
    const resultItem = page.getByRole('option').filter({ hasText: 'Java programming' });
    await expect(resultItem).toBeVisible();

    // Select using keyboard to avoid click issues with cmdk overlays
    // cmdk usually selects the first item by default or we press ArrowDown
    // Let's press ArrowDown to be sure, then Enter.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 4. Verify navigation
    const encodedId = encodeURIComponent('http://example.org/concept/java');
    await expect(page).toHaveURL(new RegExp(`/concept/${encodedId.replace(/\./g, '\\.')}`), { timeout: 10000 });

    // 5. Verify page content
    await expect(page.getByRole('heading', { name: 'Java programming' })).toBeVisible();
  });

  test('Scenario 3: Concept Details & Data Integrity', async ({ page }) => {
    const id = 'http://example.org/concept/java';
    await page.goto(`/concept/${encodeURIComponent(id)}`);

    await expect(page.getByRole('heading', { name: 'Java programming' })).toBeVisible();
    await expect(page.getByText('A high-level, class-based, object-oriented programming language.')).toBeVisible();
    await expect(page.getByText('Concept').first()).toBeVisible();

    await expect(page.getByText('related')).toBeVisible();
    const pythonLink = page.getByRole('link', { name: 'Python' });
    await expect(pythonLink).toBeVisible();

    await pythonLink.click();

    const pythonId = encodeURIComponent('http://example.org/concept/python');
    await expect(page).toHaveURL(new RegExp(`/concept/${pythonId.replace(/\./g, '\\.')}`));
    await expect(page.getByRole('heading', { name: 'Python' })).toBeVisible();
  });

  test('Scenario 4: Inline Editing Workflow', async ({ page }) => {
    const id = 'http://example.org/concept/java';
    await page.goto(`/concept/${encodeURIComponent(id)}`);

    await expect(page.getByRole('heading', { name: 'Java programming' })).toBeVisible();

    // 1. Click the "Click to edit" div
    const headingEdit = page.locator('h1').getByTitle('Click to edit');
    await headingEdit.click();

    // 2. Locate input
    const editInput = page.locator('input[value="Java programming"]');
    await expect(editInput).toBeVisible();
    await expect(editInput).toBeFocused();

    // 3. Edit and Save
    // Clear text first? .fill replaces it.
    await editInput.fill('Java Updated');

    // Press Enter using page keyboard to ensure it hits the focused element
    await page.keyboard.press('Enter');

    // 4. Verify UI update
    await expect(page.getByRole('heading', { name: 'Java Updated' })).toBeVisible();
  });

});
