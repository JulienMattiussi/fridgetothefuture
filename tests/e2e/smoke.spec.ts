import { expect, test } from '@playwright/test'

test('the scene fills the window', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  // R3F sizes the canvas after its first layout (ResizeObserver): wait for it.
  await expect
    .poll(async () => {
      const box = await canvas.boundingBox()
      return box && { width: box.width, height: box.height }
    })
    .toEqual(page.viewportSize())
})
