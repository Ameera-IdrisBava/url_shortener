// server.js
const express = require('express')
const mongoose = require('mongoose')
const shortUrl = require('./models/shortUrl')
const app = express()

mongoose.connect('mongodb://localhost/urlShortener');

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public')) // for CSS & JS

app.get('/', async (req, res) => {
  const shortUrls = await shortUrl.find()
  res.render('index', {
    shortUrls: shortUrls,
    request: req
  })
})

app.post('/short', async (req, res) => {
  await shortUrl.create({ full: req.body.fullurl })
  res.redirect('/')
})

// AJAX POST route to increment click and return full URL
app.post('/:shortUrl', async (req, res) => {
  const url = await shortUrl.findOne({ short: req.params.shortUrl })
  if (!url) return res.status(404).json({ error: 'Not found' })

  url.clicks++
  await url.save()
  res.json({ full: url.full })
})

// fallback GET route for normal redirection
app.get('/:shortUrl', async (req, res) => {
  const url = await shortUrl.findOne({ short: req.params.shortUrl })
  if (!url) return res.sendStatus(404)

  url.clicks++
  await url.save()
  res.redirect(url.full)
})

app.listen(process.env.PORT || 5000)