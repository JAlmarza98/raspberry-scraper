// @ts-check

const { chromium } = require('playwright')

const shops = [
  {
    vendor: 'KUBII',
    url: 'https://www.kubii.es/raspberry-pi-3-2-b/2771-nuevo-raspberry-pi-4-modelo-b-2gb-3272496308794.html?src=raspberrypi',
    checkStock: async ({ page }) => {
      const content = await page.textContent('[id="availability_value"]')
      const hasStock = content?.includes('En rupture de stock') === false
      const price = await page.textContent('[id="our_price_display"]')
      return { hasStock, price }
    }
  },
  {
    vendor: 'Tiendatec',
    url: 'https://www.tiendatec.es/raspberry-pi/gama-raspberry-pi/1099-raspberry-pi-4-modelo-b-2gb-765756931175.html?src=raspberrypi',
    checkStock: async ({ page }) => {
      let hasStock
      try {
        const content = await page.textContent('[class="estimacion_nostock"]', { timeout: 1000 })
        hasStock = !content?.includes('Producto no disponible temporalmente')
      } catch (error) {
        hasStock = true
      }

      let price = await page.textContent('[class="current-price-value"]')
      price = price.trim()
      return { hasStock, price }
    }
  },
  {
    vendor: 'Amazon',
    url: 'https://www.amazon.es/Raspberry-ARM-Cortex-A72-WLAN-ac-Bluetooth-Micro-HDMI/dp/B07TD42S27/ref=sr_1_5?keywords=raspberry+pi+4+2gb&qid=1672934479&sprefix=rasspberry+pi+4+2%2Caps%2C89&sr=8-5',
    checkStock: async ({ page }) => {
      let hasStock = await page.textContent('[class="a-size-medium a-color-success"]')
      hasStock = hasStock.includes('En stock')
      const price = await page.textContent('[class="a-offscreen"]')
      return { hasStock, price }
    }
  },
  {
    vendor: 'PcComponentes',
    url: 'https://www.pccomponentes.com/raspberry-pi-4-modelo-b-2gb',
    checkStock: async ({ page }) => {
      let hasStock
      let price
      try {
        const content = await page.textContent('[class="btn btn-primary btn-lg buy GTM-addToCart buy-button js-article-buy"]', { timeout: 1000 })
        console.log(content)
        hasStock = !!content?.includes('Comprar')
        price = await page.textContent('[class="precioMain h1"]')
      } catch (error) {
        hasStock = false
        price = null
      }

      return { hasStock, price }
    }
  }

]

;(async () => {
  const browser = await chromium.launch()

  for (const shop of shops) {
    const { vendor, url, checkStock } = shop

    const page = await browser.newPage()
    await page.goto(url)

    const { hasStock, price } = await checkStock({ page })
    console.log(`${vendor}: ${hasStock ? 'in stock' : 'out of stock'} => ${price}`)
    await page.screenshot({ path: `screenshots/${vendor}.png` })
    await page.close()
  }

  await browser.close()
})()
