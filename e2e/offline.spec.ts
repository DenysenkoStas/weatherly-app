import { expect, test, type Page } from '@playwright/test'
import { mockApis } from './mocks'

// The service worker controls the page only after it activates: until then nothing is cached
async function waitForServiceWorker(page: Page): Promise<void> {
  await page.goto('./')
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)
}

const updatedOffline = /^Оновлено о .+ · офлайн$/

test('cities opened online are shown offline', async ({ page, context }) => {
  await mockApis(context)
  await waitForServiceWorker(page)
  await page.goto('./?lat=49.59&lon=34.55')
  await expect(page.getByRole('heading', { name: 'Полтава' })).toBeVisible()
  await page.goto('./?lat=50.45&lon=30.52')
  await expect(page.getByRole('heading', { name: 'Київ' })).toBeVisible()

  // Without the mocks the requests go to the (now absent) network
  await context.unrouteAll()
  await context.setOffline(true)

  await page.reload()
  const kyiv = page.getByRole('region', { name: 'Київ' })
  await expect(kyiv.getByText('5°C', { exact: true })).toBeVisible()
  await expect(kyiv.getByText(updatedOffline)).toBeVisible()

  await page.goto('./?lat=49.59&lon=34.55')
  const poltava = page.getByRole('region', { name: 'Полтава' })
  await expect(poltava.getByText('-2°C', { exact: true })).toBeVisible()
  await expect(poltava.getByText(updatedOffline)).toBeVisible()
  await expect(page.getByRole('region', { name: 'Якість повітря' })).toBeVisible()
})

test('a city never opened online reports an error offline', async ({ page, context }) => {
  await mockApis(context)
  await waitForServiceWorker(page)

  await context.unrouteAll()
  await context.setOffline(true)
  await page.goto('./?lat=46.48&lon=30.72')

  await expect(page.getByText('Не вдалося отримати дані погоди').first()).toBeVisible()
})
