// @ts-check

const { chromium } = require('playwright')

const shops = [
  {
    vendor: 'KUBII',
    url: 'https://www.kubii.es/raspberry-pi-3-2-b/2771-nuevo-raspberry-pi-4-modelo-b-2gb-3272496308794.html?src=raspberrypi',
    checkStock: async ({ page }) => {
      const content = await page.textContent('[id="availability_value"]')
      return content?.includes('En rupture de stock') === false
    }
  },
  {
    vendor: 'Tiendatec',
    url: 'https://www.tiendatec.es/raspberry-pi/gama-raspberry-pi/1099-raspberry-pi-4-modelo-b-2gb-765756931175.html?src=raspberrypi',
    checkStock: async ({ page }) => {
      let content
      try {
        content = await page.textContent('[class="estimacion_nostock"]', { timeout: 1000 })
      } catch (error) {
        content = 'hay stock'
      }
      return content?.includes('Producto no disponible temporalmente') === false
    }
  }

]

;(async () => {
  const browser = await chromium.launch()

  for (const shop of shops) {
    const { vendor, url, checkStock } = shop

    const page = await browser.newPage()
    await page.goto(url)

    const hasStock = await checkStock({ page })
    console.log(`${vendor}: ${hasStock ? 'in stock' : 'out of stock'}`)
    await page.screenshot({ path: `screenshots/${vendor}.png` })
    await page.close()
  }

  await browser.close()
})()
