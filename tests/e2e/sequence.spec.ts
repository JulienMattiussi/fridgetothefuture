import { expect, test, type Page } from '@playwright/test'
import type { Action } from '@/lib/sequence'
import type { SequenceStore } from '@/three/sequence/store'

/** Plays a step through the sequence the page hands over (`?e2e`). */
const act = (page: Page, action: Action) =>
  page.evaluate(
    (step) => (window as unknown as { sequence: SequenceStore }).sequence.act(step),
    action,
  )

/** Plays a step, then waits for the hint that follows it. */
async function play(page: Page, action: Action, hint: string) {
  await act(page, action)
  await expect(page.getByText(hint)).toBeVisible({ timeout: 60_000 })
}

test('the film plays through to the iced tea, then starts over', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/?e2e')
  await expect(page.getByRole('button', { name: 'Recommencer' })).toBeHidden()
  for (let log = 0; log < 3; log++) await act(page, 'loadStove')
  await expect(page.getByText('petite vanne')).toBeVisible({ timeout: 60_000 })
  await play(page, 'openSmallValve', "Montez à l'échelle")
  await play(page, 'climbLadder', 'vanne du haut')
  await play(page, 'openTopValve', 'Tourne à fond')
  await play(page, 'turnCrank', 'grande vanne de cuivre')
  await play(page, 'openValve', 'levez la bassine')
  await play(page, 'holdBasin', 'à la pince')
  await play(page, 'useTongs', '« Thé glacé ? »')
  await expect(page.getByText('Fin n°1 débloquée !')).toBeVisible()
  await page.getByRole('button', { name: 'Succès' }).click()
  await expect(page.getByText('Fin 1 : Thé glacé')).toBeVisible()
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await expect(page.getByText('bûches de Doc')).toBeVisible()
})
