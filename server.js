let checkSkroutz = require('./checkSkroutz.js');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening at ${port}`));
app.use(express.static('./public'));
app.use(express.json());

app.post('/check', async (req, res) => {
  let barcode = req.body.barcode
  let prices = await checkSkroutz.check(barcode);
  res.json(prices)
})