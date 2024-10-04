const puppeteer = require('puppeteer')
const mongoose = require('mongoose')
require('dotenv').config()

const Data = mongoose.model(
  'Data',
  new mongoose.Schema({
    title: String,
    price: String
  })
)

const connect = async () => {
  try {
    await mongoose.connect(process.env.mongo_URI)
    console.log('Connected to DB 😍')
  } catch (err) {
    console.error('not connected to database 😬')
  }
}

const scrapeProducts = async () => {
  await connect()
  const url = 'https://www.amazon.es'
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  })
  const page = await browser.newPage()
  await page.goto(url)
  const foundElement = await page.waitForSelector(
    ['#twotabsearchtextbox', '#nav-bb-search'].join(',')
  )
  const idName = await page.evaluate((el) => el.id, foundElement)
  console.log(idName)
  await page.type('#' + idName, 'galeón andalucía' + String.fromCharCode(13))

  await page
    //.waitForSelector('div[data-index="3"]') //busca algo que cargue despues de las búsquedas incluso si no encuentras
    .waitForNavigation()
    .then(() => console.log('encontre el dataindex'))
  const title = await page.$$eval(
    'div.s-search-results h2 span.a-size-base-plus',
    (nodes) => nodes.map((n) => n.innerText)
  )
  const price = await page.$$eval(
    'div.s-price-instructions-style[data-cy="price-recipe"] span.a-price[data-a-color="base"] span.a-offscreen',
    (nodes) => nodes.map((n) => n.innerText)
  )
  // console.log(title)
  // console.log(title.length)
  // console.log(price)
  // console.log(price.length)

  const amazonProduct = title.map((value, index) => {
    return {
      title: title[index],
      price: price[index]
    }
  })
  console.log(amazonProduct)
}

scrapeProducts()
