const express = require('express')
const ip = require('ip');
const ipAddress = ip.address();
const app = express()
const port = 3000
const apiKey = "1234567890"

function combineBytes(bytes, from, to) {
  return bytes.subarray(from, to).reduce((a, p) => 256 * a + p, 0);
}

const decodeReading = (reading, device) => {
  const buff = Buffer.from(reading.message, "base64");
  console.log(reading.message, buff);
  return {
    deviceSynced: new Date(reading.synced),
    timestamp: new Date(combineBytes(buff, 0, 4) * 1000),
    touchSensor1: !!buff[4],
    touchSensor2: !!buff[5],
    battery: buff[6],
    charging: buff[7],
    device,
  };
};

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/users/interval', (req, res) => {
    res.send('60000')
})

app.post('/users/readings', (req, res) => {
    console.log(req.body);
    req.body.messages.forEach(element => {
      console.log(decodeReading(element, req.body.deviceId))
    });
    res.send('OK');
})

app.post('/users/register', (req, res) => {
    console.log(req.body);
    // return json with api key
    res.send({apiKey: apiKey});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`Network access via: ${ipAddress}:${port}!`);
})