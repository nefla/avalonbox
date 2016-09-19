const express = require('express')
const app = express()
app.set('view engine', 'pug')
app.set('views', 'pages/views')
app.use(express.static('pages'))
app.use(express.static('./'))


app.get('/', function (req, res) {
  res.render('demo')
})

app.get('/index', function (req, res) {
  res.render('index')
})

app.listen(3000, function () {
  console.log('Running...')
})
