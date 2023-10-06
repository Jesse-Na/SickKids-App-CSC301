const express = require('express')
const app = express()
const port = 3000
const apiKey = "1234567890"

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/users/interval', (req, res) => {
    res.send('60000')
})

app.post('/users/readings', (req, res) => {
    console.log(req.body);
    res.send('OK');
})

app.post('/users/register', (req, res) => {
    console.log(req.body);
    res.send(apiKey);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})