import { expect, test } from '@playwright/test'
import { mockApis } from './mocks'

test.beforeEach(async ({ context }) => {
  await mockApis(context)
})

test('a favorite city stays after a reload and opens from its chip', async ({ page }) => {
  await page.goto('./?lat=49.59&lon=34.55')
  await page.getByRole('button', { name: 'Додати до обраного' }).click()

  const favorites = page.getByRole('navigation', { name: 'Обрані міста' })
  await expect(favorites.getByRole('button', { name: /^Полтава/ })).toBeVisible()

  // Another city, then back through the chip after a reload
  await page.goto('./?lat=50.45&lon=30.52')
  await expect(page.getByRole('heading', { name: 'Київ' })).toBeVisible()
  await page.reload()
  await favorites.getByRole('button', { name: /^Полтава/ }).click()

  await expect(page.getByRole('heading', { name: 'Полтава' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Видалити з обраного', exact: true })).toBeVisible()
})
