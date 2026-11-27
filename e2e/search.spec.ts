import { expect, test } from '@playwright/test'
import { mockApis } from './mocks'

test.beforeEach(async ({ context }) => {
  await mockApis(context)
})

test('finds a city and shows its weather', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('combobox', { name: 'Пошук міста...' }).fill('Полт')
  await page.getByRole('option', { name: /Полтава/ }).click()

  const card = page.getByRole('region', { name: 'Полтава' })
  await expect(card.getByRole('heading', { name: 'Полтава' })).toBeVisible()
  await expect(card.getByText('-2°C', { exact: true })).toBeVisible()
  // The page link keeps the place
  await expect(page).toHaveURL(/lat=49\.59&lon=34\.55/)
})

test('says so when no city is found', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('combobox', { name: 'Пошук міста...' }).fill('Ххх')

  await expect(page.getByText('Місто не знайдено').first()).toBeVisible()
})
