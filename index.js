const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/precios-supermercado', async (req, res) => {
  try {
    const supermarketId = req.query.supermarketId; // Obtener el identificador del supermercado desde la URL
    let url, priceSelector, titleSelector, brandSelector;

    // Configurar los selectores según el identificador del supermercado
    if (supermarketId === 'tata') {
      url = 'https://www.tata.com.uy/';
      priceSelector = 'p.styles__BestPrice-msqlmx-14.gnEqiQ';
      titleSelector = 'h2.styles__Title-msqlmx-7.cXhzcn';
      brandSelector = 'p.styles__Brand-msqlmx-6.hObHKj';
    } else if (supermarketId === 'disco') {
      url = 'https://www.disco.com.uy/almacen';
      priceSelector = 'span.discouy-disco-store-4-x-sellingPriceWithUnitMultiplier';
      titleSelector = 'span.vtex-product-summary-2-x-productBrand.vtex-product-summary-2-x-brandName.t-body';
      brandSelector = 'span.vtex-product-summary-2-x-productBrandName';
    } else {
      return res.status(400).json({ error: 'Supermercado no válido' });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector(priceSelector, { timeout: 30000 });

    const data = await page.evaluate((priceSelector, titleSelector, brandSelector) => {
      const priceElements = document.querySelectorAll(priceSelector);
      const titleElements = document.querySelectorAll(titleSelector);
      const brandElements = document.querySelectorAll(brandSelector);

      const prices = Array.from(priceElements).map(element => element.textContent.trim());
      const titles = Array.from(titleElements).map(element => element.textContent.trim());
      const brands = Array.from(brandElements).map(element => element.textContent.trim());

      const result = [];
      for (let i = 0; i < prices.length; i++) {
        result.push({ title: titles[i], price: prices[i], brand: brands[i] });
      }

      return result;
    }, priceSelector, titleSelector, brandSelector);

    await browser.close();

    res.json({ data });
  } catch (error) {
    console.error('Ocurrió un error:', error);
    res.status(500).json({ error: 'Ocurrió un error al realizar el web scraping' });
  }
});

app.post('/publish', (req, res) => {
  res.json({ message: 'Servicios publicados exitosamente' });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
