import { expect, test } from '@playwright/test'

test('the buttons play the film through to the iced tea', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/')
  const click = (name: string) => page.getByRole('button', { name }).click({ timeout: 60_000 })
  await click('Ouvrir la vanne')
  await click('Tourner la manivelle')
  await click('Présenter la bassine')
  await click('Prendre la pince')
  await expect(page.getByText('« Thé glacé ? »')).toBeVisible()
  await click('Recommencer')
  await expect(page.getByRole('button', { name: 'Ouvrir la vanne' })).toBeVisible()
})
