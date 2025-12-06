import { test, expect, request } from '@playwright/test';




test('like counter increase', async({page})=>{
await page.goto('https://conduit.bondaracademy.com/');
await page.getByText('Global Feed').click()
const firstLikesButton = page.locator('app-article-preview').first().locator('button')
await firstLikesButton.click()
})